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
};

export type CartItem = Product & {
  quantity: number;
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
  productName: string;
  totalAmount: number;
  amountPaid: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  lastPaymentDate: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
};
