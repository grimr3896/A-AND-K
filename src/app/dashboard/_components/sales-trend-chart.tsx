
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
}

const chartConfig = {
  sales: {
    label: 'Sales (KSh)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function SalesTrendChart({ data }: SalesTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] w-full text-muted-foreground">
                No sales data for this period.
            </div>
        );
    }
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            // Basic check to format date differently based on potential granularity
            if (String(value).includes('-')) return value; // Assumes YYYY-MM-DD or similar
            return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
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
