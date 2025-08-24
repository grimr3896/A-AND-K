
import type { Product, Sale, Layaway, Customer, AuditLog, User } from './types';

// This is now a default/fallback password. The actual password will be managed in context/localStorage.
let currentAdminPassword = "ALEXA";

export const getAdminPassword = () => currentAdminPassword;

export const setAdminPassword = (newPassword: string) => {
  currentAdminPassword = newPassword;
  return true;
};

export const mockUsers: User[] = [
    { id: 'USER001', username: 'A&Kbabyshop', role: 'Admin' },
    { id: 'USER002', username: 'manager', role: 'Manager' },
    { id: 'USER003', username: 'staff', role: 'Staff' },
];

// --- Deprecated Mock Data ---
// This data is no longer actively used by the application but is kept for reference 
// or potential fallback testing. The app now uses a Prisma database.

export const mockProducts: Product[] = [
  // Clothes
  { id: 'PROD001', name: 'Organic Cotton Onesie (3-pack)', sku: 'CL-OC-01', category: 'Clothes', stock: 50, price: 3200, lowStockThreshold: 15, cost: 1800, minPrice: 3000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Baby Threads Co.', description: 'Soft, breathable 100% organic cotton onesies.' },
  { id: 'PROD002', name: 'Fleece-Lined Baby Jacket', sku: 'CL-FJ-02', category: 'Clothes', stock: 25, price: 4500, lowStockThreshold: 10, cost: 2500, minPrice: 4200, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Cozy Kids', description: 'A warm and cozy fleece-lined jacket for chilly days.' },
  { id: 'PROD004', name: 'Sleep & Play Footie Pajamas', sku: 'CL-SP-04', category: 'Clothes', stock: 40, price: 2800, lowStockThreshold: 10, cost: 1500, minPrice: 2600, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Dreamy Baby', description: 'Comfortable one-piece pajamas for sleep and play.' },
  { id: 'PROD005', name: 'Denim Baby Overalls', sku: 'CL-DO-05', category: 'Clothes', stock: 18, price: 3800, lowStockThreshold: 5, cost: 2200, minPrice: 3500, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Cozy Kids', description: 'Stylish and durable denim overalls for toddlers.' },
  
  // Accessories
  { id: 'PROD003', name: 'Knit Baby Booties', sku: 'AC-KB-03', category: 'Accessories', stock: 60, price: 1500, lowStockThreshold: 20, cost: 800, minPrice: 1400, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Baby Threads Co.', description: 'Hand-knitted baby booties to keep little feet warm.' },
  { id: 'PROD021', name: 'Sun Hat with UV Protection', sku: 'AC-SH-05', category: 'Accessories', stock: 50, price: 1800, lowStockThreshold: 15, cost: 900, minPrice: 1600, imageUrl: 'https://placehold.co/150x150.png', supplier: 'SunSafe Kids', description: 'A wide-brimmed sun hat with UPF 50+ protection.' },
  
  // Blankets
  { id: 'PROD022', name: 'Muslin Swaddle Blankets (4-pack)', sku: 'BL-MS-01', category: 'Blankets', stock: 80, price: 3500, lowStockThreshold: 20, cost: 2000, minPrice: 3200, imageUrl: 'https://placehold.co/150x150.png', supplier: 'SnuggleBug', description: 'Lightweight and breathable muslin swaddle blankets.' },
  { id: 'PROD023', name: 'Plush Baby Blanket', sku: 'BL-PB-02', category: 'Blankets', stock: 40, price: 2800, lowStockThreshold: 10, cost: 1500, minPrice: 2600, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Cuddle Toys', description: 'An ultra-soft plush blanket for cuddling and naps.' },
  
  // Shoes
  { id: 'PROD024', name: 'Soft Sole Leather Baby Shoes', sku: 'SH-SL-01', category: 'Shoes', stock: 55, price: 2200, lowStockThreshold: 15, cost: 1200, minPrice: 2000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Tiny Toes', description: 'Flexible soft sole shoes perfect for first walkers.' },
  { id: 'PROD025', name: 'Baby Sneakers with Velcro', sku: 'SH-SV-02', category: 'Shoes', stock: 30, price: 3000, lowStockThreshold: 10, cost: 1700, minPrice: 2800, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Kiddy Kicks', description: 'Stylish and easy-to-wear sneakers for toddlers.' },
  
  // Bags
  { id: 'PROD026', name: 'Diaper Bag Backpack', sku: 'BG-DB-01', category: 'Bags', stock: 25, price: 8500, lowStockThreshold: 5, cost: 5000, minPrice: 8000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'MomGo', description: 'A spacious and stylish diaper bag with multiple compartments.' },
  { id: 'PROD027', name: 'Toddler Character Backpack', sku: 'BG-TB-02', category: 'Bags', stock: 40, price: 2500, lowStockThreshold: 10, cost: 1400, minPrice: 2300, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Playful Packs', description: 'A cute and fun backpack for your toddler\'s essentials.' },
];

export const mockSales: Sale[] = [
  { id: 'SALE001', date: '2024-07-22T10:30:00Z', customerName: 'Jane Doe', items: [{ productId: 'PROD001', name: 'Organic Cotton Onesie (3-pack)', quantity: 1, price: 3200 }], total: 3200, paymentMethod: 'Card' },
  { id: 'SALE002', date: '2024-07-22T11:05:00Z', customerName: 'John Smith', items: [{ productId: 'PROD025', name: 'Baby Sneakers with Velcro', quantity: 1, price: 3000 }], total: 3000, paymentMethod: 'M-Pesa' },
  { id: 'SALE003', date: '2024-07-21T15:00:00Z', customerName: 'Alice Johnson', items: [{ productId: 'PROD026', name: 'Diaper Bag Backpack', quantity: 1, price: 8500 }], total: 8500, paymentMethod: 'Cash' },
  { id: 'SALE004', date: '2024-07-20T12:45:00Z', customerName: 'Bob Williams', items: [{ productId: 'PROD004', name: 'Sleep & Play Footie Pajamas', quantity: 2, price: 2800 }], total: 5600, paymentMethod: 'Card' },
  { id: 'SALE005', date: '2024-07-23T09:15:00Z', customerName: 'Charlie Brown', items: [{ productId: 'PROD022', name: 'Muslin Swaddle Blankets (4-pack)', quantity: 1, price: 3500 }], total: 3500, paymentMethod: 'Card' },
  { id: 'SALE006', date: '2024-07-23T14:20:00Z', customerName: 'Diana Prince', items: [{ productId: 'PROD002', name: 'Fleece-Lined Baby Jacket', quantity: 1, price: 4500 }, { productId: 'PROD003', name: 'Knit Baby Booties', quantity: 2, price: 1500 }], total: 7500, paymentMethod: 'M-Pesa' },
];

export const mockLayaways: Layaway[] = [
  { id: 'LAY001', customerName: 'Fiona Glenanne', productName: 'Diaper Bag Backpack', totalAmount: 8500, amountPaid: 4000, status: 'Pending', lastPaymentDate: '2024-07-15' },
  { id: 'LAY002', customerName: 'George Mason', productName: 'Plush Baby Blanket', totalAmount: 2800, amountPaid: 2800, status: 'Paid', lastPaymentDate: '2024-06-28' },
  { id: 'LAY003', customerName: 'Hannah Abbott', productName: 'Fleece-Lined Baby Jacket', totalAmount: 4500, amountPaid: 2000, status: 'Pending', lastPaymentDate: '2024-07-20' },
  { id: 'LAY004', customerName: 'Ian Malcolm', productName: 'Soft Sole Leather Baby Shoes', totalAmount: 2200, amountPaid: 1000, status: 'Pending', lastPaymentDate: '2024-07-18' },
];

export const salesDataForAI = JSON.stringify([
  {"date": "2024-07-01", "productId": "PROD001", "quantity": 5},
  {"date": "2024-07-05", "productId": "PROD004", "quantity": 15},
  {"date": "2024-07-10", "productId": "PROD001", "quantity": 3},
  {"date": "2024-07-20", "productId": "PROD003", "quantity": 2},
], null, 2);

export const productDetailsForAI = JSON.stringify(mockProducts.map(p => ({
  productId: p.id,
  name: p.name,
  currentStock: p.stock,
  category: p.category,
})), null, 2);
