

import { z } from 'zod';

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

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  agreedPrice: number; // The price for this transaction, which can be adjusted
  price: number; // The standard price before any adjustments
  stock: number;
  category: string;
  minPrice: number;
  imageUrl?: string;
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

export type BusinessInfo = {
    name: string;
    address: string;
    taxRate: number;
    customFields: { [key: string]: string | number };
}

// Types for Email Report Generation
const ProductSaleSchema = z.object({
    name: z.string(),
    quantitySold: z.number(),
    totalRevenue: z.number(),
});

const StockInfoSchema = z.object({
    name: z.string(),
    quantityInStock: z.number(),
});

export const EmailReportInputSchema = z.object({
  salesData: z.array(ProductSaleSchema).describe("A list of products sold, including quantities and revenue."),
  lowStockItems: z.array(StockInfoSchema).describe("A list of items that are low in stock."),
  outOfStockItems: z.array(StockInfoSchema).describe("A list of items that are completely out of stock."),
});
export type EmailReportInput = z.infer<typeof EmailReportInputSchema>;

export const EmailReportOutputSchema = z.object({
  htmlBody: z.string().describe("The full HTML content of the email report."),
});
export type EmailReportOutput = z.infer<typeof EmailReportOutputSchema>;
