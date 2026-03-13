'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/platform/trpc';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

import { useStatsFilterStore } from '../../stores/useStatsFilterStore';
import { computeStatsDateRange } from '../../utils/computeDateRange';

export type TagTimeData = {
  tagId: string;
  name: string;
  color: string;
  hours: number;
};

type ChartDataItem = {
  name: string;
  hours: number;
  fill: string;
};

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

// =============================================================================
// Pure Presentational Component (Storybook-friendly)
// =============================================================================

interface TagTimeChartPureProps {
  data: TagTimeData[] | null;
  isLoading?: boolean;
  title?: string;
  description?: string;
  noDataLabel?: string;
}

export function TagTimeChartPure({
  data,
  isLoading,
  title = 'Tag Time',
  description = 'Hours by tag',
  noDataLabel = 'No data',
}: TagTimeChartPureProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
            {noDataLabel}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData: ChartDataItem[] = data.slice(0, 10).map((item) => ({
    name: item.name,
    hours: item.hours,
    fill: item.color,
  }));

  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);

  const chartConfig = chartData.reduce((config: ChartConfig, item: ChartDataItem) => {
    config[item.name] = { label: item.name, color: item.fill };
    return config;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Total {formatHours(totalHours)} - Top {Math.min(data.length, 10)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 16 }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={80}
              tickFormatter={(value: string) =>
                value.length > 10 ? `${value.slice(0, 10)}...` : value
              }
            />
            <XAxis dataKey="hours" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent formatter={(value) => formatHours(Number(value))} hideLabel />
              }
            />
            <Bar dataKey="hours" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Connected Component (uses tRPC + store)
// =============================================================================

export function TagTimeChart() {
  const t = useTranslations('calendar.stats.metrics');
  const currentDate = useStatsFilterStore((s) => s.currentDate);
  const granularity = useStatsFilterStore((s) => s.granularity);
  const dateRange = useMemo(
    () => computeStatsDateRange(currentDate, granularity),
    [currentDate, granularity],
  );

  const { data, isPending } = api.entries.getTimeByTag.useQuery(dateRange);

  return (
    <TagTimeChartPure
      data={data ?? null}
      isLoading={isPending}
      title={t('tagTimeChart')}
      description={t('tagTimeChartDesc')}
      noDataLabel={t('noData')}
    />
  );
}
