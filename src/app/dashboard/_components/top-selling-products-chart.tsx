
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

// Mock data simulating top selling products by revenue
const topProductsData = [
  { name: 'Classic Blue Jeans', revenue: 79990 },
  { name: 'Floral Tea Dress', revenue: 59990 },
  { name: 'Leather Ankle Boots', revenue: 48000 },
  { name: 'Summer Maxi Dress', revenue: 32500 },
  { name: 'Premium Bibs', revenue: 25000 }, // Added example
  { name: 'Baby Carrier X', revenue: 22000 }, // Added example
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
        <XAxis type="number" dataKey="revenue" tickFormatter={(value) => `KSh ${value / 1000}k`} />
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
             formatter={(value) => `KSh ${value.toLocaleString()}`}
             indicator="dot"
          />}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
