"use client";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
  } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const monthlySalesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
];

const chartConfig = {
    sales: {
      label: 'Sales',
      color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;

export function MonthlySalesChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart data={monthlySalesData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
            </BarChart>
        </ChartContainer>
    )
}
