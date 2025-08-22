

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  cost: number;
  minPrice: number;
  imageUrl?: string;
  supplier?: string;
  description?: string;
};

export type CartItem = Product & {
  quantity: number;
  currentPrice: number; // The price for this transaction, which can be adjusted
  originalPrice: number; // The standard price before any adjustments
  managerOverride?: boolean;
};

export type Sale = {
  id: string;
  date: string;
  customerName: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: 'Cash' | 'M-Pesa' | 'Card';
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  purchaseHistory: Sale[];
};

export type Layaway = {
  id: string;
  customerName: string;
  productName: string; // This can be a summary like "3 items"
  totalAmount: number;
  amountPaid: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  lastPaymentDate: string;
};

export type Payment = {
    date: string;
    amount: number;
    method: 'Cash' | 'M-Pesa' | 'Card';
}

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
};

export type UserRole = 'Admin' | 'Manager' | 'Staff';

export type User = {
    id: string;
    username: string;
    role: UserRole;
}

    
