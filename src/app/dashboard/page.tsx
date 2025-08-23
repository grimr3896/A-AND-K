
"use client";

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { mockSales, mockProducts } from '@/lib/mock-data';
import { SalesTrendChart } from './_components/sales-trend-chart';
import { TopSellingProductsChart } from './_components/top-selling-products-chart';
import { SalesByCategoryChart } from './_components/sales-by-category-chart';
import { isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, subDays } from 'date-fns';
import type { ChartConfig } from '@/components/ui/chart';

type DateRange = 'today' | 'this-week' | 'this-month' | 'this-year';

const categoryColors: {[key: string]: string} = {
  'Clothes': 'hsl(var(--chart-1))',
  'Accessories': 'hsl(var(--chart-2))',
  'Blankets': 'hsl(var(--chart-3))',
  'Shoes': 'hsl(var(--chart-4))',
  'Bags': 'hsl(var(--chart-5))',
};

const categoryChartConfig = Object.keys(categoryColors).reduce((acc, key) => {
    acc[key.toLowerCase()] = { label: key, color: categoryColors[key] };
    return acc;
}, {} as ChartConfig);


export default function Dashboard() {
  const [dateRange, setDateRange] = React.useState<DateRange>('this-month');

  const filteredSalesData = React.useMemo(() => {
    const now = new Date();
    let interval;
    switch (dateRange) {
        case 'today':
            interval = { start: new Date(now.setHours(0,0,0,0)), end: new Date(now.setHours(23,59,59,999)) };
            break;
        case 'this-week':
            interval = { start: startOfWeek(now), end: endOfWeek(now) };
            break;
        case 'this-month':
            interval = { start: startOfMonth(now), end: endOfMonth(now) };
            break;
        case 'this-year':
             interval = { start: startOfYear(now), end: endOfYear(now) };
             break;
        default:
             interval = { start: startOfMonth(now), end: endOfMonth(now) };
    }
    return mockSales.filter(sale => isWithinInterval(new Date(sale.date), interval));
  }, [dateRange]);

  // --- KPI Calculations (based on filtered data) ---
    const totalRevenue = filteredSalesData.reduce((acc, sale) => acc + sale.total, 0);
    const totalTransactions = filteredSalesData.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Monthly target is independent of the filter
    const monthlyRevenue = mockSales
        .filter(sale => isWithinInterval(new Date(sale.date), {start: startOfMonth(new Date()), end: endOfMonth(new Date())}))
        .reduce((acc, sale) => acc + sale.total, 0);
    const monthlyTarget = 500000;
    const monthlyProgress = (monthlyRevenue / monthlyTarget) * 100;

  const salesTrendChartData = React.useMemo(() => {
     const dataMap = new Map<string, number>();
     let dateFormat = "MMM d";
     if (dateRange === 'this-year') dateFormat = "MMM";

     filteredSalesData.forEach(sale => {
         const key = format(new Date(sale.date), dateFormat);
         dataMap.set(key, (dataMap.get(key) || 0) + sale.total);
     });

     return Array.from(dataMap.entries()).map(([date, sales]) => ({ date, sales })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredSalesData, dateRange]);

  const salesByCategoryData = React.useMemo(() => {
    const categorySales = new Map<string, number>();
    filteredSalesData.forEach(sale => {
        sale.items.forEach(item => {
            const product = mockProducts.find(p => p.id === item.productId);
            if(product) {
                categorySales.set(product.category, (categorySales.get(product.category) || 0) + (item.price * item.quantity));
            }
        });
    });
    return Array.from(categorySales.entries()).map(([category, sales]) => ({
        category,
        sales,
        fill: categoryColors[category] || 'hsl(var(--muted))'
    }));
  }, [filteredSalesData]);

  const topSellingProductsData = React.useMemo(() => {
      const productSales = new Map<string, { name: string; revenue: number }>();
      filteredSalesData.forEach(sale => {
        sale.items.forEach(item => {
            const current = productSales.get(item.productId) || { name: item.name, revenue: 0 };
            current.revenue += item.price * item.quantity;
            productSales.set(item.productId, current);
        });
      });
      return Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);
  }, [filteredSalesData]);


  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* --- Filters --- */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <div className="flex items-center gap-2 ml-auto">
           <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- KPIs Banner --- */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CardDescription>For the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSh {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
             <CardDescription>Target: KSh {monthlyTarget.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{monthlyProgress.toFixed(1)}%</div>
            <Progress value={monthlyProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction Value</CardTitle>
             <CardDescription>For the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSh {averageTransactionValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CardDescription>For the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTransactions}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>
                {
                    dateRange === 'today' ? 'Today\'s Sales Trend' :
                    dateRange === 'this-week' ? 'Weekly Sales Trend' :
                    dateRange === 'this-month' ? 'Monthly Sales Trend' :
                    dateRange === 'this-year' ? 'Yearly Sales Trend' : 'Sales Trend'
                }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesTrendChart data={salesTrendChartData} dateKey="date" />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <SalesByCategoryChart data={salesByCategoryData} chartConfig={categoryChartConfig}/>
            </CardContent>
        </Card>
      </div>

       <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
             <CardDescription>
                Top 6 products by revenue for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopSellingProductsChart data={topSellingProductsData} />
          </CardContent>
      </Card>
    </div>
  );
}
