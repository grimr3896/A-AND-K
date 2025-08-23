
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

// Mock data simulating top selling products by revenue
const topProductsData = [
  { name: 'Organic Cotton Onesie', revenue: 79990 },
  { name: 'Diaper Bag Backpack', revenue: 59990 },
  { name: 'Fleece-Lined Baby Jacket', revenue: 48000 },
  { name: 'Muslin Swaddle Blankets', revenue: 32500 },
  { name: 'Soft Sole Leather Shoes', revenue: 25000 },
  { name: 'Ergonomic Baby Carrier', revenue: 22000 },
];

export function TopSellingProductsChart() {
  return (
    <ChartContainer config={{}} className="h-[350px] w-full">
      <BarChart
        layout="vertical"
        data={topProductsData}
        margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" dataKey="revenue" tickFormatter={(value) => `KSh ${Number(value) / 1000}k`} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={120}
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={<ChartTooltipContent
             formatter={(value) => `KSh ${Number(value).toLocaleString()}`}
             indicator="dot"
          />}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
