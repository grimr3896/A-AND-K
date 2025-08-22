"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';

const categorySalesData = [
  { name: 'Dresses', value: 400 },
  { name: 'Trousers', value: 300 },
  { name: 'Shirts', value: 300 },
  { name: 'Shoes', value: 200 },
  { name: 'Accessories', value: 150 },
];
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];


export function CategorySalesChart() {
    return (
        <ChartContainer config={{}} className="h-[400px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={categorySalesData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            dataKey="value"
          >
            {categorySalesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    )
}