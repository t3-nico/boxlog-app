'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/platform/trpc';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

import { useStatsFilterStore } from '../../stores/useStatsFilterStore';
import type { EstimationAccuracyData } from '../../types/metrics.types';
import { computeStatsDateRange } from '../../utils/computeDateRange';

const chartConfig: ChartConfig = {
  avgPlannedMinutes: {
    label: 'Planned',
    color: 'var(--color-chart-1)',
  },
  avgActualMinutes: {
    label: 'Actual',
    color: 'var(--color-chart-2)',
  },
};

function formatMinutes(value: number): string {
  if (value >= 60) {
    const hours = Math.floor(value / 60);
    const mins = Math.round(value % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${Math.round(value)}m`;
}

// =============================================================================
// Pure Presentational Component (Storybook-friendly)
// =============================================================================

interface EstimationAccuracyChartPureProps {
  data: EstimationAccuracyData[] | null;
  isLoading?: boolean;
  title?: string;
  description?: string;
  plannedLabel?: string;
  actualLabel?: string;
  noDataLabel?: string;
}

export function EstimationAccuracyChartPure({
  data,
  isLoading,
  title = 'Estimation Accuracy by Tag',
  description = 'Planned vs actual duration',
  plannedLabel = 'Planned',
  actualLabel = 'Actual',
  noDataLabel = 'No data',
}: EstimationAccuracyChartPureProps) {
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

  const chartData = data.map((item) => ({
    name: item.tagName,
    avgPlannedMinutes: Math.round(item.avgPlannedMinutes),
    avgActualMinutes: Math.round(item.avgActualMinutes),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
            <XAxis type="number" hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const label = name === 'avgPlannedMinutes' ? plannedLabel : actualLabel;
                    return `${label}: ${formatMinutes(Number(value))}`;
                  }}
                />
              }
            />
            <Bar
              dataKey="avgPlannedMinutes"
              fill="var(--color-avgPlannedMinutes)"
              radius={[5, 5, 5, 5]}
            />
            <Bar
              dataKey="avgActualMinutes"
              fill="var(--color-avgActualMinutes)"
              radius={[5, 5, 5, 5]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Connected Component (uses tRPC + store)
// =============================================================================

export function EstimationAccuracyChart() {
  const t = useTranslations('calendar.stats.metrics');
  const currentDate = useStatsFilterStore((s) => s.currentDate);
  const granularity = useStatsFilterStore((s) => s.granularity);

  const dateRange = useMemo(
    () => computeStatsDateRange(currentDate, granularity),
    [currentDate, granularity],
  );

  const { data, isPending } = api.entries.getEstimationAccuracy.useQuery(dateRange);

  return (
    <EstimationAccuracyChartPure
      data={data ?? null}
      isLoading={isPending}
      title={t('estimationChart')}
      description={t('estimationChartDesc')}
      plannedLabel={t('planned')}
      actualLabel={t('actual')}
      noDataLabel={t('noData')}
    />
  );
}
