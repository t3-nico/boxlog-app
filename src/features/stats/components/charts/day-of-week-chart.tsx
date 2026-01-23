'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/trpc';

const chartConfig = {
  hours: {
    label: '作業時間',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
}

export function DayOfWeekChart() {
  const { data, isPending } = api.plans.getDayOfWeekDistribution.useQuery();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>曜日別作業時間</CardTitle>
          <CardDescription>どの曜日に多く作業しているか</CardDescription>
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
          <CardTitle>曜日別作業時間</CardTitle>
          <CardDescription>どの曜日に多く作業しているか</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-32 items-center justify-center">
            データがありません
          </div>
        </CardContent>
      </Card>
    );
  }

  // 最も作業時間が多い曜日を見つける
  const firstItem = data[0];
  const maxDay = firstItem
    ? data.reduce((max, item) => (item.hours > max.hours ? item : max), firstItem)
    : undefined;

  // 平日と週末の合計
  const weekdayHours = data.slice(0, 5).reduce((sum, item) => sum + item.hours, 0);
  const weekendHours = data.slice(5).reduce((sum, item) => sum + item.hours, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>曜日別作業時間</CardTitle>
        <CardDescription>
          最も多い: {maxDay?.day}曜 ({formatHours(maxDay?.hours ?? 0)})
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

        {/* 平日 vs 週末 */}
        <div className="text-muted-foreground mt-2 flex justify-center gap-4 text-xs">
          <span>平日: {formatHours(weekdayHours)}</span>
          <span>週末: {formatHours(weekendHours)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
