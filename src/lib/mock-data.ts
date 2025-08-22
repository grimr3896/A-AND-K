import type { Product, Sale, Layaway, Customer, AuditLog } from './types';

export const mockProducts: Product[] = [
  { id: 'PROD001', name: 'Floral Tea Dress', sku: 'TD-FL-01', category: 'Dresses', stock: 12, price: 5999, lowStockThreshold: 5, cost: 3500, minPrice: 5500 },
  { id: 'PROD002', name: 'Classic Blue Jeans', sku: 'JN-CL-01', category: 'Trousers', stock: 25, price: 7999, lowStockThreshold: 10, cost: 4500, minPrice: 7500 },
  { id: 'PROD003', name: 'Linen Button-Up Shirt', sku: 'SH-LN-01', category: 'Shirts', stock: 4, price: 4500, lowStockThreshold: 5, cost: 2500, minPrice: 4000 },
  { id: 'PROD004', name: 'Leather Ankle Boots', sku: 'BT-LT-01', category: 'Shoes', stock: 8, price: 12000, lowStockThreshold: 5, cost: 7000, minPrice: 11000 },
  { id: 'PROD005', name: 'Wool-blend Scarf', sku: 'AC-WB-01', category: 'Accessories', stock: 30, price: 2550, lowStockThreshold: 10, cost: 1200, minPrice: 2200 },
  { id: 'PROD006', name: 'Summer Maxi Dress', sku: 'TD-SM-02', category: 'Dresses', stock: 15, price: 6500, lowStockThreshold: 5, cost: 3800, minPrice: 6000 },
  { id: 'PROD007', name: 'Cotton Chinos', sku: 'TR-CT-02', category: 'Trousers', stock: 18, price: 5500, lowStockThreshold: 10, cost: 3000, minPrice: 5000 },
];

export const mockSales: Sale[] = [
  { id: 'SALE001', date: '2024-07-22T10:30:00Z', customerName: 'Jane Doe', items: [{ productId: 'PROD001', name: 'Floral Tea Dress', quantity: 1, price: 5999 }], total: 5999, paymentMethod: 'Card' },
  { id: 'SALE002', date: '2024-07-22T11:05:00Z', customerName: 'John Smith', items: [{ productId: 'PROD002', name: 'Classic Blue Jeans', quantity: 1, price: 7999 }, { productId: 'PROD003', name: 'Linen Button-Up Shirt', quantity: 1, price: 4500 }], total: 12499, paymentMethod: 'M-Pesa' },
  { id: 'SALE003', date: '2024-07-21T15:00:00Z', customerName: 'Alice Johnson', items: [{ productId: 'PROD004', name: 'Leather Ankle Boots', quantity: 1, price: 12000 }], total: 12000, paymentMethod: 'Cash' },
  { id: 'SALE004', date: '2024-07-20T12:45:00Z', customerName: 'Bob Williams', items: [{ productId: 'PROD005', name: 'Wool-blend Scarf', quantity: 2, price: 2550 }], total: 5100, paymentMethod: 'Card' },
];

export const mockLayaways: Layaway[] = [
  { id: 'LAY001', customerName: 'Emily Clark', productName: 'Summer Maxi Dress', totalAmount: 6500, amountPaid: 2000, status: 'Pending', lastPaymentDate: '2024-07-15' },
  { id: 'LAY002', customerName: 'Michael Brown', productName: 'Leather Ankle Boots', totalAmount: 12000, amountPaid: 6000, status: 'Pending', lastPaymentDate: '2024-07-18' },
];

export const mockCustomers: Customer[] = [
  { id: 'CUST001', name: 'Jane Doe', phone: '555-0101', email: 'jane.doe@example.com', purchaseHistory: [mockSales[0]] },
  { id: 'CUST002', name: 'John Smith', phone: '555-0102', email: 'john.smith@example.com', purchaseHistory: [mockSales[1]] },
  { id: 'CUST003', name: 'Alice Johnson', phone: '555-0103', email: 'alice.j@example.com', purchaseHistory: [mockSales[2]] },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'LOG001', timestamp: '2024-07-22T09:05:14Z', user: 'Admin', action: 'Product Added', details: 'Added "Summer Maxi Dress" (PROD006)' },
  { id: 'LOG002', timestamp: '2024-07-22T10:30:00Z', user: 'Cashier1', action: 'Sale Processed', details: 'Sale ID: SALE001, Total: 5999' },
  { id: 'LOG003', timestamp: '2024-07-22T11:15:21Z', user: 'Admin', action: 'Stock Updated', details: 'Updated stock for "Linen Button-Up Shirt" (PROD003) to 4' },
  { id: 'LOG004', timestamp: '2024-07-23T14:00:00Z', user: 'Admin', action: 'User Edit', details: 'Changed permissions for user: Cashier2' },
];

export const salesDataForAI = JSON.stringify([
  {"date": "2024-07-01", "productId": "PROD001", "quantity": 2},
  {"date": "2024-07-03", "productId": "PROD002", "quantity": 1},
  {"date": "2024-07-05", "productId": "PROD003", "quantity": 3},
  {"date": "2024-07-10", "productId": "PROD001", "quantity": 1},
  {"date": "2024-07-15", "productId": "PROD002", "quantity": 2},
  {"date": "2024-07-20", "productId": "PROD003", "quantity": 1},
  {"date": "2024-07-21", "productId": "PROD004", "quantity": 1},
], null, 2);

export const productDetailsForAI = JSON.stringify([
  {"productId": "PROD001", "name": "Floral Tea Dress", "currentStock": 12},
  {"productId": "PROD002", "name": "Classic Blue Jeans", "currentStock": 25},
  {"productId": "PROD003", "name": "Linen Button-Up Shirt", "currentStock": 4},
  {"productId": "PROD004", "name": "Leather Ankle Boots", "currentStock": 8},
], null, 2);
