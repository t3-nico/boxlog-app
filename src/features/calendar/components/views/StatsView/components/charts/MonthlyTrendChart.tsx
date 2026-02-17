'use client';

import { Area, AreaChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

const chartConfig = {
  hours: {
    label: 'Hours',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export function MonthlyTrendChart() {
  const { data, isPending } = api.plans.getMonthlyTrend.useQuery();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
            No data
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
  const avgHours = totalHours / data.length;
  const lastMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];

  let trend = '';
  if (lastMonth && prevMonth && prevMonth.hours > 0) {
    const change = ((lastMonth.hours - prevMonth.hours) / prevMonth.hours) * 100;
    trend = change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
        <CardDescription>
          Avg: {formatHours(avgHours)}/mo {trend && `(MoM ${trend})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 16, top: 10, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.replace('月', '')}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatHours(Number(value))}
                  labelFormatter={(label) => `${label}`}
                />
              }
            />
            <defs>
              <linearGradient id="fillHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-hours)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-hours)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="hours"
              type="monotone"
              fill="url(#fillHours)"
              stroke="var(--color-hours)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>

        <div className="text-muted-foreground mt-2 text-center text-xs">
          Annual total: {formatHours(totalHours)}
        </div>
      </CardContent>
    </Card>
  );
}
