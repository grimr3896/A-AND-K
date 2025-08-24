
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
import { SalesTrendChart } from './_components/sales-trend-chart';
import { TopSellingProductsChart } from './_components/top-selling-products-chart';
import { SalesByCategoryChart } from './_components/sales-by-category-chart';
import { getDashboardStats } from '@/lib/actions';
import type { DashboardStats } from '@/lib/types';
import type { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

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


function DashboardClient({ initialStats, dateRange: initialDateRange }: { initialStats: DashboardStats | null, dateRange: DateRange }) {
  const [stats, setStats] = React.useState(initialStats);
  const [dateRange, setDateRange] = React.useState<DateRange>(initialDateRange);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchStats = async () => {
        setIsLoading(true);
        const newStats = await getDashboardStats(dateRange);
        setStats(newStats);
        setIsLoading(false);
    }
    fetchStats();
  }, [dateRange]);

  const salesByCategoryData = React.useMemo(() => {
    if (!stats) return [];
    return stats.salesByCategory.map(item => ({
        ...item,
        fill: categoryColors[item.category] || 'hsl(var(--muted))'
    }));
  }, [stats]);
  
  const monthlyTarget = 500000;
  const monthlyProgress = stats ? (stats.monthlyRevenue / monthlyTarget) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* --- Filters --- */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <div className="flex items-center gap-2 ml-auto">
           <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)} disabled={isLoading}>
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
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-3xl font-bold">KSh {stats?.totalRevenue.toLocaleString() || 0}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
             <CardDescription>Target: KSh {monthlyTarget.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-3xl font-bold">{monthlyProgress.toFixed(1)}%</div>}
            <Progress value={monthlyProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction Value</CardTitle>
             <CardDescription>For the selected period</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-3xl font-bold">KSh {stats?.averageTransactionValue.toFixed(2) || '0.00'}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CardDescription>For the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-3xl font-bold">{stats?.totalTransactions || 0}</div>}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : <SalesTrendChart data={stats?.salesTrend || []} />}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-[350px] w-full" /> : <SalesByCategoryChart data={salesByCategoryData} chartConfig={categoryChartConfig}/>}
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
            {isLoading ? <Skeleton className="h-[350px] w-full" /> : <TopSellingProductsChart data={stats?.topSellingProducts || []} />}
          </CardContent>
      </Card>
    </div>
  );
}


export default function DashboardPage() {
    const [stats, setStats] = React.useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    React.useEffect(() => {
        getDashboardStats('this-month').then(data => {
            setStats(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h1 className="text-2xl font-bold">Executive Dashboard</h1>
                    <div className="flex items-center gap-2 ml-auto">
                        <Skeleton className="h-10 w-[180px]" />
                    </div>
                </div>
                 <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card><CardHeader><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-32 mt-1" /></CardHeader><CardContent><Skeleton className="h-8 w-3/4" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-32 mt-1" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /><Skeleton className="h-2 w-full mt-2" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-32 mt-1" /></CardHeader><CardContent><Skeleton className="h-8 w-3/4" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-32 mt-1" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-5">
                    <Card className="xl:col-span-3"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>
                    <Card className="xl:col-span-2"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
                </div>
                <Card className="col-span-full"><CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64 mt-1" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
            </div>
        );
    }

    return <DashboardClient initialStats={stats} dateRange="this-month" />;
}
