"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { mockSales, mockProducts } from '@/lib/mock-data';
import type { Product, Sale } from '@/lib/types';
import { subDays, isWithinInterval } from 'date-fns';

type BestSeller = {
  product: Product;
  quantitySold: number;
  totalRevenue: number;
};

function calculateBestSellers(sales: Sale[], products: Product[], startDate: Date, endDate: Date): BestSeller[] {
  const productSales: { [productId: string]: { quantitySold: number; totalRevenue: number } } = {};

  const relevantSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return isWithinInterval(saleDate, { start: startDate, end: endDate });
  });

  relevantSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { quantitySold: 0, totalRevenue: 0 };
      }
      productSales[item.productId].quantitySold += item.quantity;
      productSales[item.productId].totalRevenue += item.price * item.quantity;
    });
  });

  const bestSellers: BestSeller[] = Object.entries(productSales)
    .map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      return product ? { product, ...data } : null;
    })
    .filter((item): item is BestSeller => item !== null)
    .sort((a, b) => b.quantitySold - a.quantitySold);

  return bestSellers;
}

function BestSellersTable({ data }: { data: BestSeller[] }) {
  if (data.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No sales data for this period.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Quantity Sold</TableHead>
          <TableHead className="text-right">Total Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(({ product, quantitySold, totalRevenue }) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell className="text-right">{quantitySold}</TableCell>
            <TableCell className="text-right">Ksh {totalRevenue.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function BestSellingItems() {
  const [dailyData, setDailyData] = React.useState<BestSeller[]>([]);
  const [weeklyData, setWeeklyData] = React.useState<BestSeller[]>([]);
  const [monthlyData, setMonthlyData] = React.useState<BestSeller[]>([]);
  
  React.useEffect(() => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = subDays(todayStart, 7);
    const monthStart = subDays(todayStart, 30);

    setDailyData(calculateBestSellers(mockSales, mockProducts, todayStart, now));
    setWeeklyData(calculateBestSellers(mockSales, mockProducts, weekStart, now));
    setMonthlyData(calculateBestSellers(mockSales, mockProducts, monthStart, now));
  }, []);

  return (
    <Tabs defaultValue="weekly">
      <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
      </TabsList>
      <TabsContent value="daily">
        <BestSellersTable data={dailyData} />
      </TabsContent>
      <TabsContent value="weekly">
        <BestSellersTable data={weeklyData} />
      </TabsContent>
      <TabsContent value="monthly">
        <BestSellersTable data={monthlyData} />
      </TabsContent>
    </Tabs>
  );
}
