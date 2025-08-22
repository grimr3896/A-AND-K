
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
import { mockSales } from '@/lib/mock-data';
import { SalesTrendChart } from './_components/sales-trend-chart';
import { TopSellingProductsChart } from './_components/top-selling-products-chart';
import { SalesByCategoryChart } from './_components/sales-by-category-chart';

export default function Dashboard() {
  const [dateRange, setDateRange] = React.useState('this-month');

  // --- KPI Calculations (based on mock data) ---
  const todaysSales = mockSales
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((acc, sale) => acc + sale.total, 0);

  const totalRevenue = mockSales.reduce((acc, sale) => acc + sale.total, 0);
  const monthlyTarget = 500000;
  const monthlyProgress = (totalRevenue / monthlyTarget) * 100;
  
  const transactionsToday = mockSales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length;
  const averageTransactionValue = mockSales.length > 0 ? totalRevenue / mockSales.length : 0;


  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* --- Filters --- */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <div className="flex items-center gap-2 ml-auto">
           <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
           <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="mpesa">M-Pesa</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- KPIs Banner --- */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSh {todaysSales.toLocaleString()}</div>
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
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KSh {averageTransactionValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transactionsToday}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesTrendChart />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <SalesByCategoryChart />
            </CardContent>
        </Card>
      </div>

       <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Top Selling Items - This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSellingProductsChart />
          </CardContent>
      </Card>
    </div>
  );
}
