'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';

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

export function DayOfWeekChart() {
  const { data, isPending } = api.plans.getDayOfWeekDistribution.useQuery();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day of Week</CardTitle>
          <CardDescription>Activity by day</CardDescription>
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
          <CardTitle>Day of Week</CardTitle>
          <CardDescription>Activity by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
            No data
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstItem = data[0];
  const maxDay = firstItem
    ? data.reduce((max, item) => (item.hours > max.hours ? item : max), firstItem)
    : undefined;

  const weekdayHours = data.slice(0, 5).reduce((sum, item) => sum + item.hours, 0);
  const weekendHours = data.slice(5).reduce((sum, item) => sum + item.hours, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day of Week</CardTitle>
        <CardDescription>
          Busiest: {maxDay?.day} ({formatHours(maxDay?.hours ?? 0)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 16 }}>
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent formatter={(value) => formatHours(Number(value))} hideLabel />
              }
            />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={5} />
          </BarChart>
        </ChartContainer>

        <div className="text-muted-foreground mt-2 flex justify-center gap-4 text-xs">
          <span>Weekdays: {formatHours(weekdayHours)}</span>
          <span>Weekends: {formatHours(weekendHours)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
