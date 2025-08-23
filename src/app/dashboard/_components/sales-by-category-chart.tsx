
"use client";

import { Pie, PieChart, Tooltip, Cell, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

type SalesByCategoryChartProps = {
    data: { category: string; sales: number; fill: string }[];
    chartConfig: ChartConfig;
}

export function SalesByCategoryChart({ data, chartConfig }: SalesByCategoryChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[350px] w-full text-muted-foreground">
                No sales data for this period.
            </div>
        );
    }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <PieChart>
        <Tooltip
          content={<ChartTooltipContent
            nameKey="category"
            formatter={(value, name, props) => {
                const total = data.reduce((acc, curr) => acc + curr.sales, 0);
                const percentage = total > 0 ? (Number(value) / total * 100) : 0;
                return `${Number(value).toLocaleString()} (${percentage.toFixed(1)}%)`;
            }}
          />}
        />
        <Pie
          data={data}
          dataKey="sales"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          strokeWidth={2}
        >
           {data.map((entry) => (
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
