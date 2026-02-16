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
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
}

export function HourlyDistributionChart() {
  const { data, isPending } = api.plans.getHourlyDistribution.useQuery();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>時間帯別分布</CardTitle>
          <CardDescription>いつ作業しているか</CardDescription>
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
          <CardTitle>時間帯別分布</CardTitle>
          <CardDescription>いつ作業しているか</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-32 items-center justify-center">
            データがありません
          </div>
        </CardContent>
      </Card>
    );
  }

  // 最も作業時間が多い時間帯を見つける
  const firstItem = data[0];
  const maxSlot = firstItem
    ? data.reduce((max, item) => (item.hours > max.hours ? item : max), firstItem)
    : undefined;
  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>時間帯別分布</CardTitle>
        <CardDescription>
          ピーク: {maxSlot?.timeSlot} ({formatHours(maxSlot?.hours ?? 0)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 16 }}
          >
            <YAxis
              dataKey="timeSlot"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={50}
            />
            <XAxis dataKey="hours" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent formatter={(value) => formatHours(Number(value))} hideLabel />
              }
            />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={5} />
          </BarChart>
        </ChartContainer>

        {/* 合計時間 */}
        <div className="text-muted-foreground mt-2 text-center text-xs">
          合計 {formatHours(totalHours)}
        </div>
      </CardContent>
    </Card>
  );
}
