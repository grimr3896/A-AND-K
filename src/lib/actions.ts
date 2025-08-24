
'use server';

import prisma from './db';
import type { Product, CartItem, Layaway, Payment } from './types';
import { revalidatePath } from 'next/cache';

// --- Audit Log ---
async function logAction(user: string, action: string, details: string) {
  try {
    await prisma.auditLog.create({
      data: { user, action, details },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// --- Product Actions ---
export async function getProducts() {
  return prisma.product.findMany({ orderBy: { name: 'asc' } });
}

export async function addProduct(productData: Omit<Product, 'id'>, user: string) {
  const newProduct = await prisma.product.create({
    data: productData,
  });
  await logAction(user, 'Product Added', `Added "${newProduct.name}" (ID: ${newProduct.id})`);
  revalidatePath('/dashboard/inventory');
  return newProduct;
}

export async function updateProduct(productData: Product, user: string) {
  const updatedProduct = await prisma.product.update({
    where: { id: productData.id },
    data: productData,
  });
  await logAction(user, 'Product Updated', `Updated "${updatedProduct.name}" (ID: ${updatedProduct.id})`);
  revalidatePath('/dashboard/inventory');
  return updatedProduct;
}

export async function deleteProduct(productId: string, user: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product) {
    await prisma.product.delete({ where: { id: productId } });
    await logAction(user, 'Product Deleted', `Deleted "${product.name}" (ID: ${productId})`);
    revalidatePath('/dashboard/inventory');
  }
}

export async function receiveStock(productId: string, quantity: number, user: string) {
    const product = await prisma.product.update({
        where: { id: productId },
        data: {
            stock: {
                increment: quantity
            }
        }
    });
    await logAction(user, 'Stock Received', `Received ${quantity} units for "${product.name}". New stock: ${product.stock}`);
    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard/stock-requirements');
}


// --- Sale/POS Actions ---
export async function processCheckout(cart: CartItem[], customerName: string, paymentMethod: string, user: string) {
  const total = cart.reduce((acc, item) => acc + item.agreedPrice * item.quantity, 0);

  const sale = await prisma.sale.create({
    data: {
      customerName: customerName || 'Walk-in Customer',
      total,
      paymentMethod,
      items: {
        create: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.agreedPrice,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  // Update stock levels
  for (const item of cart) {
    await prisma.product.update({
      where: { id: item.id },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }

  await logAction(user, 'Sale Processed', `Sale ID: ${sale.id}, Total: ${sale.total.toFixed(2)}`);
  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/sales-history');
  return sale;
}


// --- Layaway Actions ---

export async function getLayaways() {
    return prisma.layaway.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getLayawayById(id: string) {
    return prisma.layaway.findUnique({
        where: { id },
        include: { payments: { orderBy: { date: 'asc' }}}
    });
}

export async function createLayaway(layawayData: Omit<Layaway, 'id'|'lastPaymentDate'>, user: string) {
    const newLayaway = await prisma.layaway.create({
        data: {
           ...layawayData,
           lastPaymentDate: new Date(),
        }
    });

    if (newLayaway.amountPaid > 0) {
        await prisma.payment.create({
            data: {
                layawayId: newLayaway.id,
                amount: newLayaway.amountPaid,
                method: 'Initial Deposit',
            }
        });
    }

    await logAction(user, 'Layaway Created', `Layaway for ${newLayaway.customerName} created. ID: ${newLayaway.id}`);
    revalidatePath('/dashboard/layaways');
    return newLayaway;
}

export async function addLayawayPayment(layawayId: string, payment: Omit<Payment, 'date' | 'id'>, user: string) {
    const layaway = await prisma.layaway.findUnique({ where: { id: layawayId } });
    if (!layaway) throw new Error("Layaway not found");

    const newPayment = await prisma.payment.create({
        data: {
            layawayId,
            amount: payment.amount,
            method: payment.method,
            date: new Date(),
        }
    });

    const updatedLayaway = await prisma.layaway.update({
        where: { id: layawayId },
        data: {
            amountPaid: {
                increment: payment.amount
            },
            lastPaymentDate: new Date(),
        }
    });
    
    if(updatedLayaway.amountPaid >= updatedLayaway.totalAmount) {
        await prisma.layaway.update({
            where: { id: layawayId },
            data: { status: 'Paid' }
        });
    }

    await logAction(user, 'Layaway Payment Added', `Added ${payment.amount} to Layaway ID: ${layawayId}`);
    revalidatePath(`/dashboard/layaways`);
    revalidatePath(`/dashboard/layaways/${layawayId}`);
    return newPayment;
}
