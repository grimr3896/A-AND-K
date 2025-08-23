
import type { Product, Sale, Layaway, Customer, AuditLog, User } from './types';

// This is now a default/fallback password. The actual password will be managed in context/localStorage.
let currentAdminPassword = "ALEXA";

export const getAdminPassword = () => currentAdminPassword;

export const setAdminPassword = (newPassword: string) => {
  currentAdminPassword = newPassword;
  return true;
};

// Default API key
export const getApiKey = () => "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";


export const mockProducts: Product[] = [
  // Baby Clothing
  { id: 'PROD001', name: 'Organic Cotton Onesie (3-pack)', sku: 'BC-OC-01', category: 'Baby Clothing', stock: 50, price: 3200, lowStockThreshold: 15, cost: 1800, minPrice: 3000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Baby Threads Co.', description: 'Soft, breathable 100% organic cotton onesies.' },
  { id: 'PROD002', name: 'Fleece-Lined Baby Jacket', sku: 'BC-FJ-02', category: 'Baby Clothing', stock: 25, price: 4500, lowStockThreshold: 10, cost: 2500, minPrice: 4200, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Cozy Kids', description: 'A warm and cozy fleece-lined jacket for chilly days.' },
  { id: 'PROD003', name: 'Knit Baby Booties', sku: 'BC-KB-03', category: 'Baby Clothing', stock: 60, price: 1500, lowStockThreshold: 20, cost: 800, minPrice: 1400, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Baby Threads Co.', description: 'Hand-knitted baby booties to keep little feet warm.' },
  { id: 'PROD004', name: 'Sleep & Play Footie Pajamas', sku: 'BC-SP-04', category: 'Baby Clothing', stock: 40, price: 2800, lowStockThreshold: 10, cost: 1500, minPrice: 2600, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Dreamy Baby', description: 'Comfortable one-piece pajamas for sleep and play.' },
  { id: 'PROD005', name: 'Denim Baby Overalls', sku: 'BC-DO-05', category: 'Baby Clothing', stock: 18, price: 3800, lowStockThreshold: 5, cost: 2200, minPrice: 3500, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Cozy Kids', description: 'Stylish and durable denim overalls for toddlers.' },

  // Nursing & Feeding
  { id: 'PROD006', name: 'Silicone Bib with Food Catcher', sku: 'NF-SB-01', category: 'Nursing', stock: 70, price: 1200, lowStockThreshold: 25, cost: 600, minPrice: 1100, imageUrl: 'https://placehold.co/150x150.png', supplier: 'FeedEasy', description: 'Easy to clean, BPA-free silicone bib with a pocket.' },
  { id: 'PROD007', name: 'Electric Breast Pump (Single)', sku: 'NF-BP-02', category: 'Nursing', stock: 15, price: 12500, lowStockThreshold: 5, cost: 8000, minPrice: 12000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'MomTech', description: 'Efficient and quiet single electric breast pump.' },
  { id: 'PROD008', name: 'Anti-Colic Baby Bottles (2-pack)', sku: 'NF-BB-03', category: 'Nursing', stock: 80, price: 2200, lowStockThreshold: 20, cost: 1200, minPrice: 2000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'FeedEasy', description: 'Designed to reduce colic, gas, and reflux.' },
  { id: 'PROD009', name: 'Nursing Cover Scarf', sku: 'NF-NC-04', category: 'Nursing', stock: 30, price: 2500, lowStockThreshold: 10, cost: 1400, minPrice: 2300, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Mommy Style', description: 'A stylish and discreet nursing cover that doubles as a scarf.' },

  // Gear
  { id: 'PROD010', name: '3-in-1 Baby Stroller System', sku: 'GE-ST-01', category: 'Gear', stock: 12, price: 45000, lowStockThreshold: 3, cost: 30000, minPrice: 42000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'GoBabyGo', description: 'A versatile stroller system that grows with your baby.' },
  { id: 'PROD011', name: 'Ergonomic Baby Carrier', sku: 'GE-BC-02', category: 'Gear', stock: 20, price: 9500, lowStockThreshold: 5, cost: 6000, minPrice: 9000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'CarryTots', description: 'Comfortable for both parent and baby, supports multiple positions.' },
  { id: 'PROD012', name: 'Convertible Car Seat', sku: 'GE-CS-03', category: 'Gear', stock: 18, price: 28000, lowStockThreshold: 5, cost: 19000, minPrice: 26500, imageUrl: 'https://placehold.co/150x150.png', supplier: 'SafeRide', description: 'A car seat that converts from rear-facing to forward-facing.' },
  { id: 'PROD013', name: 'Portable Playard with Bassinet', sku: 'GE-PP-04', category: 'Gear', stock: 15, price: 18000, lowStockThreshold: 4, cost: 12000, minPrice: 17000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'GoBabyGo', description: 'A safe space for baby to play or sleep, at home or on the go.' },

  // Toys
  { id: 'PROD014', name: 'Wooden Activity Cube', sku: 'TY-AC-01', category: 'Toys', stock: 35, price: 6500, lowStockThreshold: 10, cost: 4000, minPrice: 6200, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Playful Minds', description: 'A multi-sided activity cube to develop fine motor skills.' },
  { id: 'PROD015', name: 'Soft Cloth Baby Books (Set of 4)', sku: 'TY-BB-02', category: 'Toys', stock: 90, price: 2300, lowStockThreshold: 30, cost: 1300, minPrice: 2100, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Little Readers', description: 'Crinkly, soft books with vibrant colors and textures.' },
  { id: 'PROD016', name: 'Stacking Rings Tower', sku: 'TY-SR-03', category: 'Toys', stock: 120, price: 950, lowStockThreshold: 40, cost: 450, minPrice: 900, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Playful Minds', description: 'Classic toy for developing hand-eye coordination.' },
  { id: 'PROD017', name: 'Plush Giraffe Rattle', sku: 'TY-PG-04', category: 'Toys', stock: 75, price: 1350, lowStockThreshold: 20, cost: 700, minPrice: 1250, imageUrl: 'https://placehold.co/150x150.png', supplier: 'Cuddle Toys', description: 'A soft and cuddly giraffe with a gentle rattle sound.' },

  // Diapering
  { id: 'PROD018', name: 'Eco-Friendly Diapers (Size 3, 96ct)', sku: 'DP-ED-01', category: 'Diapering', stock: 100, price: 4200, lowStockThreshold: 25, cost: 2800, minPrice: 4000, imageUrl: 'https://placehold.co/150x150.png', supplier: 'EcoBaby', description: 'Hypoallergenic and biodegradable diapers.' },
  { id: 'PROD019', name: 'Sensitive Water Wipes (4-pack)', sku: 'DP-WW-02', category: 'Diapering', stock: 150, price: 1800, lowStockThreshold: 50, cost: 1100, minPrice: 1700, imageUrl: 'https://placehold.co/150x150.png', supplier: 'PureClean', description: '99.9% water wipes, perfect for sensitive skin.' },
  { id: 'PROD020', name: 'Diaper Pail with Refills', sku: 'DP-DP-03', category: 'Diapering', stock: 22, price: 7500, lowStockThreshold: 5, cost: 5000, minPrice: 7200, imageUrl: 'https://placehold.co/150x150.png', supplier: 'OdorLock', description: 'A diaper pail that effectively seals in odors.' },
];

export const mockSales: Sale[] = [
  { id: 'SALE001', date: '2024-07-22T10:30:00Z', customerName: 'Jane Doe', items: [{ productId: 'PROD001', name: 'Organic Cotton Onesie (3-pack)', quantity: 1, price: 3200 }], total: 3200, paymentMethod: 'Card' },
  { id: 'SALE002', date: '2024-07-22T11:05:00Z', customerName: 'John Smith', items: [{ productId: 'PROD016', name: 'Stacking Rings Tower', quantity: 1, price: 950 }, { productId: 'PROD019', name: 'Sensitive Water Wipes (4-pack)', quantity: 1, price: 1800 }], total: 2750, paymentMethod: 'M-Pesa' },
  { id: 'SALE003', date: '2024-07-21T15:00:00Z', customerName: 'Alice Johnson', items: [{ productId: 'PROD011', name: 'Ergonomic Baby Carrier', quantity: 1, price: 9500 }], total: 9500, paymentMethod: 'Cash' },
  { id: 'SALE004', date: '2024-07-20T12:45:00Z', customerName: 'Bob Williams', items: [{ productId: 'PROD006', name: 'Silicone Bib with Food Catcher', quantity: 2, price: 1200 }], total: 2400, paymentMethod: 'Card' },
  { id: 'SALE005', date: '2024-07-23T09:15:00Z', customerName: 'Charlie Brown', items: [{ productId: 'PROD010', name: '3-in-1 Baby Stroller System', quantity: 1, price: 45000 }], total: 45000, paymentMethod: 'Card' },
  { id: 'SALE006', date: '2024-07-23T14:20:00Z', customerName: 'Diana Prince', items: [{ productId: 'PROD002', name: 'Fleece-Lined Baby Jacket', quantity: 1, price: 4500 }, { productId: 'PROD003', name: 'Knit Baby Booties', quantity: 2, price: 1500 }], total: 7500, paymentMethod: 'M-Pesa' },
  { id: 'SALE007', date: '2024-07-24T16:00:00Z', customerName: 'Ethan Hunt', items: [{ productId: 'PROD018', name: 'Eco-Friendly Diapers (Size 3, 96ct)', quantity: 3, price: 4200 }], total: 12600, paymentMethod: 'Cash' },
];

export const mockLayaways: Layaway[] = [
  { id: 'LAY001', customerName: 'Fiona Glenanne', productName: 'Convertible Car Seat', totalAmount: 28000, amountPaid: 10000, status: 'Pending', lastPaymentDate: '2024-07-15' },
  { id: 'LAY002', customerName: 'George Mason', productName: 'Portable Playard with Bassinet', totalAmount: 18000, amountPaid: 18000, status: 'Paid', lastPaymentDate: '2024-06-28' },
  { id: 'LAY003', customerName: 'Hannah Abbott', productName: '3-in-1 Baby Stroller System', totalAmount: 45000, amountPaid: 25000, status: 'Pending', lastPaymentDate: '2024-07-20' },
  { id: 'LAY004', customerName: 'Ian Malcolm', productName: 'Electric Breast Pump (Single)', totalAmount: 12500, amountPaid: 5000, status: 'Pending', lastPaymentDate: '2024-07-18' },
];

export const mockCustomers: Customer[] = [
  { id: 'CUST001', name: 'Jane Doe', phone: '555-0101', email: 'jane.doe@example.com', purchaseHistory: [mockSales[0]] },
  { id: 'CUST002', name: 'John Smith', phone: '555-0102', email: 'john.smith@example.com', purchaseHistory: [mockSales[1]] },
  { id: 'CUST003', name: 'Alice Johnson', phone: '555-0103', email: 'alice.j@example.com', purchaseHistory: [mockSales[2]] },
  { id: 'CUST004', name: 'Bob Williams', phone: '555-0104', email: 'bob.w@example.com', purchaseHistory: [mockSales[3]] },
  { id: 'CUST005', name: 'Charlie Brown', phone: '555-0105', email: 'charlie.b@example.com', purchaseHistory: [mockSales[4]] },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'LOG001', timestamp: '2024-07-22T09:05:14Z', user: 'Admin', action: 'Product Added', details: 'Added "Organic Cotton Onesie (3-pack)" (PROD001)' },
  { id: 'LOG002', timestamp: '2024-07-22T10:30:00Z', user: 'Staff', action: 'Sale Processed', details: 'Sale ID: SALE001, Total: 3200' },
  { id: 'LOG003', timestamp: '2024-07-22T11:15:21Z', user: 'Manager', action: 'Stock Updated', details: 'Updated stock for "Knit Baby Booties" (PROD003) to 58' },
  { id: 'LOG004', timestamp: '2024-07-23T14:00:00Z', user: 'Admin', action: 'User Edit', details: 'Changed role for user: staff' },
  { id: 'LOG005', timestamp: '2024-07-24T10:00:00Z', user: 'Admin', action: 'API Key Generated', details: 'New API key generated for Reporting service.' },
  { id: 'LOG006', timestamp: '2024-07-24T11:00:00Z', user: 'Manager', action: 'Layaway Created', details: 'New layaway plan LAY003 created for Hannah Abbott.' },
];

export const salesDataForAI = JSON.stringify([
  {"date": "2024-07-01", "productId": "PROD001", "quantity": 5},
  {"date": "2024-07-03", "productId": "PROD008", "quantity": 10},
  {"date": "2024-07-05", "productId": "PROD016", "quantity": 15},
  {"date": "2024-07-10", "productId": "PROD001", "quantity": 3},
  {"date": "2024-07-15", "productId": "PROD019", "quantity": 20},
  {"date": "2024-07-20", "productId": "PROD003", "quantity": 2},
  {"date": "2024-07-21", "productId": "PROD011", "quantity": 1},
], null, 2);

export const productDetailsForAI = JSON.stringify(mockProducts.map(p => ({
  productId: p.id,
  name: p.name,
  currentStock: p.stock,
  category: p.category,
})), null, 2);


export const mockUsers: User[] = [
    { id: 'USER001', username: 'A&Kbabyshop', role: 'Admin' },
    { id: 'USER002', username: 'manager', role: 'Manager' },
    { id: 'USER003', username: 'staff', role: 'Staff' },
];
