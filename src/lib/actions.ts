
'use server';

import prisma from './db';
import type { Product, CartItem, Layaway, Payment, DashboardStats } from './types';
import { revalidatePath } from 'next/cache';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, format } from 'date-fns';
import { mockLayaways, mockProducts, mockSales } from './mock-data';

// --- Audit Log ---
async function logAction(user: string, action: string, details: string) {
    try {
        // This would write to a real DB, for now, we can log to console.
        console.log(`AUDIT [${user}]: ${action} - ${details}`);
        // await prisma.auditLog.create({
        //     data: {
        //         user,
        //         action,
        //         details,
        //     },
        // });
    } catch (error) {
        console.error("Failed to log action:", error);
    }
}

// --- Product Actions ---
export async function getProducts(): Promise<Product[]> {
  return Promise.resolve(mockProducts);
}

export async function addProduct(productData: Omit<Product, 'id'>, user: string) {
  const newProduct: Product = { ...productData, id: `PROD_NEW_${Date.now()}`};
  mockProducts.push(newProduct);
  await logAction(user, 'Product Added (Mock)', `Added "${newProduct.name}" (ID: ${newProduct.id})`);
  revalidatePath('/dashboard/inventory');
  return newProduct;
}

export async function updateProduct(productData: Product, user: string) {
  const index = mockProducts.findIndex(p => p.id === productData.id);
  if (index !== -1) {
    mockProducts[index] = productData;
  }
  await logAction(user, 'Product Updated (Mock)', `Updated "${productData.name}" (ID: ${productData.id})`);
  revalidatePath('/dashboard/inventory');
  return productData;
}

export async function deleteProduct(productId: string, user: string) {
  const product = mockProducts.find(p => p.id === productId);
  if (product) {
      // mockProducts = mockProducts.filter(p => p.id !== productId);
      await logAction(user, 'Product Deleted (Mock)', `Deleted "${product.name}" (ID: ${productId})`);
      revalidatePath('/dashboard/inventory');
  }
}

export async function receiveStock(productId: string, quantity: number, user: string) {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
        product.stock += quantity;
        await logAction(user, 'Stock Received (Mock)', `Received ${quantity} units for "${product.name}". New stock: ${product.stock}`);
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/stock-requirements');
    }
}


// --- Sale/POS Actions ---
export async function processCheckout(cart: CartItem[], customerName: string, paymentMethod: string, user: string) {
  const total = cart.reduce((acc, item) => acc + item.agreedPrice * item.quantity, 0);

  const sale = {
      id: `SALE_${Date.now()}`,
      date: new Date().toISOString(),
      customerName: customerName || 'Walk-in Customer',
      total,
      paymentMethod,
      items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.agreedPrice,
      })),
  };
  mockSales.push(sale);

  // Update stock levels in mock data
  for (const item of cart) {
    const product = mockProducts.find(p => p.id === item.id);
    if (product) {
        product.stock -= item.quantity;
    }
  }

  await logAction(user, 'Sale Processed (Mock)', `Sale ID: ${sale.id}, Total: ${sale.total.toFixed(2)}`);
  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/sales-history');
  revalidatePath('/dashboard');
  return sale;
}


// --- Layaway Actions ---

export async function getLayaways(): Promise<Layaway[]> {
    return Promise.resolve(mockLayaways);
}

export async function getLayawayById(id: string) {
    // This is a mock implementation, so we don't have payment details inside layaway object.
    const layaway = mockLayaways.find(l => l.id === id);
    // In a real scenario, payments would be a separate query. We'll return an empty array for mock.
    return layaway ? Promise.resolve({ ...layaway, payments: [] }) : Promise.resolve(null);
}

export async function createLayaway(layawayData: Omit<Layaway, 'id'|'lastPaymentDate'>, user: string) {
    const newLayaway = {
        ...layawayData,
        id: `LAY_NEW_${Date.now()}`,
        lastPaymentDate: new Date().toISOString(),
    };
    mockLayaways.push(newLayaway);

    await logAction(user, 'Layaway Created (Mock)', `Layaway for ${newLayaway.customerName} created. ID: ${newLayaway.id}`);
    revalidatePath('/dashboard/layaways');
    return newLayaway;
}

export async function addLayawayPayment(layawayId: string, payment: Omit<Payment, 'date' | 'id' | 'layawayId'>, user: string) {
    const layaway = mockLayaways.find(l => l.id === layawayId);
    if (!layaway) throw new Error("Layaway not found");

    layaway.amountPaid += payment.amount;
    layaway.lastPaymentDate = new Date().toISOString();
    layaway.status = layaway.amountPaid >= layaway.totalAmount ? 'Paid' : 'Pending';

    await logAction(user, 'Layaway Payment Added (Mock)', `Added ${payment.amount} to Layaway ID: ${layawayId}`);
    revalidatePath(`/dashboard/layaways`);
    revalidatePath(`/dashboard/layaways/${layawayId}`);
    return { ...payment, id: `PAY_${Date.now()}`, date: new Date().toISOString(), layawayId };
}

// --- Dashboard Actions ---
export async function getDashboardStats(range: 'today' | 'this-week' | 'this-month' | 'this-year'): Promise<DashboardStats> {
    const now = new Date();
    let gte: Date;

    switch (range) {
        case 'today':
            gte = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'this-week':
            gte = startOfWeek(now);
            break;
        case 'this-month':
            gte = startOfMonth(now);
            break;
        case 'this-year':
            gte = startOfYear(now);
            break;
    }

    const salesInRange = mockSales.filter(s => new Date(s.date) >= gte);

    const totalRevenue = salesInRange.reduce((acc, sale) => acc + sale.total, 0);
    const totalTransactions = salesInRange.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const monthlySales = mockSales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= startOfMonth(now) && saleDate <= endOfMonth(now);
    });
    const monthlyRevenue = monthlySales.reduce((acc, sale) => acc + sale.total, 0);
    
    const salesTrendMap = new Map<string, number>();
    const dateFormat = range === 'this-year' ? 'MMM' : 'MMM d';
    salesInRange.forEach(sale => {
        const key = format(new Date(sale.date), dateFormat);
        salesTrendMap.set(key, (salesTrendMap.get(key) || 0) + sale.total);
    });
    const salesTrend = Array.from(salesTrendMap.entries()).map(([date, sales]) => ({ date, sales })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const categorySalesMap = new Map<string, number>();
    salesInRange.forEach(sale => {
        sale.items.forEach(item => {
             const product = mockProducts.find(p => p.id === item.productId);
             if (product) {
                 const category = product.category;
                 categorySalesMap.set(category, (categorySalesMap.get(category) || 0) + (item.price * item.quantity));
             }
        });
    });
    const salesByCategory = Array.from(categorySalesMap.entries()).map(([category, sales]) => ({ category, sales }));

    const productSalesMap = new Map<string, { name: string, totalRevenue: number }>();
    salesInRange.forEach(sale => {
        sale.items.forEach(item => {
            const current = productSalesMap.get(item.productId) || { name: item.name, totalRevenue: 0 };
            current.totalRevenue += item.price * item.quantity;
            productSalesMap.set(item.productId, current);
        });
    });
    const topSellingProducts = Array.from(productSalesMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 6);

    return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        monthlyRevenue,
        salesTrend,
        salesByCategory,
        topSellingProducts,
    };
}
