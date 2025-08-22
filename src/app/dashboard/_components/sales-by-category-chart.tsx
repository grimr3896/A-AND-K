
"use client";

import { Pie, PieChart, Tooltip, Cell, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const salesByCategoryData = [
  { category: 'Baby Clothing', sales: 45, fill: 'var(--color-clothing)' },
  { category: 'Nursing', sales: 25, fill: 'var(--color-nursing)' },
  { category: 'Gear', sales: 15, fill: 'var(--color-gear)' },
  { category: 'Toys', sales: 15, fill: 'var(--color-toys)' },
];

const chartConfig = {
  sales: {
    label: 'Sales',
  },
  clothing: {
    label: 'Baby Clothing',
    color: 'hsl(var(--chart-1))',
  },
  nursing: {
    label: 'Nursing',
    color: 'hsl(var(--chart-2))',
  },
  gear: {
    label: 'Gear',
    color: 'hsl(var(--chart-3))',
  },
  toys: {
    label: 'Toys',
    color: 'hsl(var(--chart-4))',
  },
};

export function SalesByCategoryChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <PieChart>
        <Tooltip
          content={<ChartTooltipContent
            nameKey="category"
            formatter={(value, name) => `${value}%`}
          />}
        />
        <Pie
          data={salesByCategoryData}
          dataKey="sales"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          strokeWidth={2}
        >
           {salesByCategoryData.map((entry) => (
             <Cell key={entry.category} fill={entry.fill} />
           ))}
        </Pie>
        <Legend
          content={({ payload }) => {
            return (
              <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                {payload?.map((entry, index) => (
                  <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.value}
                  </li>
                ))}
              </ul>
            )
          }}
        />
      </PieChart>
    </ChartContainer>
  );
}
