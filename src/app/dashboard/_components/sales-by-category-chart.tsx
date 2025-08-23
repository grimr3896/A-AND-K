
"use client";

import { Pie, PieChart, Tooltip, Cell, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const salesByCategoryData = [
  { category: 'Clothes', sales: 35, fill: 'var(--color-clothes)' },
  { category: 'Accessories', sales: 15, fill: 'var(--color-accessories)' },
  { category: 'Blankets', sales: 10, fill: 'var(--color-blankets)' },
  { category: 'Shoes', sales: 8, fill: 'var(--color-shoes)' },
  { category: 'Bags', sales: 7, fill: 'var(--color-bags)' },
  { category: 'Nursing', sales: 10, fill: 'var(--color-nursing)' },
  { category: 'Gear', sales: 5, fill: 'var(--color-gear)' },
  { category: 'Toys', sales: 5, fill: 'var(--color-toys)' },
  { category: 'Diapering', sales: 5, fill: 'var(--color-diapering)' },
];

const chartConfig = {
  sales: {
    label: 'Sales',
  },
  clothes: {
    label: 'Clothes',
    color: 'hsl(var(--chart-1))',
  },
  accessories: {
    label: 'Accessories',
    color: 'hsl(var(--chart-2))',
  },
  blankets: {
    label: 'Blankets',
    color: 'hsl(var(--chart-3))',
  },
  shoes: {
    label: 'Shoes',
    color: 'hsl(var(--chart-4))',
  },
  bags: {
    label: 'Bags',
    color: 'hsl(var(--chart-5))',
  },
  nursing: {
    label: 'Nursing',
    color: 'hsl(var(--chart-2))', // Re-using colors for simplicity
  },
  gear: {
    label: 'Gear',
    color: 'hsl(var(--chart-3))',
  },
  toys: {
    label: 'Toys',
    color: 'hsl(var(--chart-4))',
  },
  diapering: {
    label: 'Diapering',
    color: 'hsl(var(--chart-5))',
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
