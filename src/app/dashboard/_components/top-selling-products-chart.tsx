
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type TopSellingProductsChartProps = {
    data: { name: string; revenue: number }[];
}

export function TopSellingProductsChart({ data }: TopSellingProductsChartProps) {
  if (!data || data.length === 0) {
    return (
        <div className="flex items-center justify-center h-[350px] w-full text-muted-foreground">
            No sales data for this period.
        </div>
    );
  }

  return (
    <ChartContainer config={{}} className="h-[350px] w-full">
      <BarChart
        layout="vertical"
        data={data}
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
