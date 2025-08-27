
import { z } from 'zod';
import type { Product as PrismaProduct, Sale as PrismaSale, SaleItem as PrismaSaleItem, Layaway as PrismaLayaway, Payment as PrismaPayment, AuditLog as PrismaAuditLog } from '@prisma/client';

export type Product = PrismaProduct;
export type Sale = PrismaSale;
export type SaleItem = PrismaSaleItem;
export type Layaway = PrismaLayaway;
export type Payment = PrismaPayment;
export type AuditLog = PrismaAuditLog;

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

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  purchaseHistory: Sale[];
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
  outOfStockItems: z.array(z.object({ name: z.string() })).describe("A list of items that are completely out of stock."),
});
export type EmailReportInput = z.infer<typeof EmailReportInputSchema>;

export const EmailReportOutputSchema = z.object({
  htmlBody: z.string().describe("The full HTML content of the email report."),
});
export type EmailReportOutput = z.infer<typeof EmailReportOutputSchema>;

// Types for Dashboard Stats
export type DashboardStats = {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    monthlyRevenue: number;
    salesTrend: { date: string; sales: number }[];
    salesByCategory: { category: string; sales: number }[];
    topSellingProducts: { name: string; totalRevenue: number }[];
};
