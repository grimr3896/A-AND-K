
"use client";

import { Line, LineChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type SalesDataPoint = {
  date: string;
  sales: number;
};

type SalesTrendChartProps = {
    data: SalesDataPoint[];
    dateKey: "date" | "month" | "year";
}

const chartConfig = {
  sales: {
    label: 'Sales (KSh)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function SalesTrendChart({ data, dateKey }: SalesTrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={dateKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <Tooltip
          content={<ChartTooltipContent
             formatter={(value) => `KSh ${Number(value).toLocaleString()}`}
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
