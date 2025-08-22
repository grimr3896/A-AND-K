
"use client";

import { Line, LineChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';


const salesTrendData = [
  { month: 'January', sales: 186000 },
  { month: 'February', sales: 305000 },
  { month: 'March', sales: 237000 },
  { month: 'April', sales: 273000 },
  { month: 'May', sales: 209000 },
  { month: 'June', sales: 314000 },
];

const chartConfig = {
  sales: {
    label: 'Sales (KSh)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function SalesTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart
        accessibilityLayer
        data={salesTrendData}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <Tooltip
          content={<ChartTooltipContent
             formatter={(value) => `KSh ${value.toLocaleString()}`}
          />}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="var(--color-sales)"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ChartContainer>
  );
}
