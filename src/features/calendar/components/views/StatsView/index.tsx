'use client';

import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { CalendarViewAnimation } from '../../animations/ViewTransition';

import { DayOfWeekChart } from './components/charts/DayOfWeekChart';
import { HourlyDistributionChart } from './components/charts/HourlyDistributionChart';
import { MonthlyTrendChart } from './components/charts/MonthlyTrendChart';
import { SleepStatsCard } from './components/charts/SleepStatsCard';
import { TagTimeChart } from './components/charts/TagTimeChart';
import { YearlyHeatmap } from './components/charts/YearlyHeatmap';
import { StatsHeroCards } from './components/StatsHeroCards';
import { StatsTable } from './components/StatsTable';
import { useStatsViewData } from './hooks/useStatsViewData';

import type { StatsViewProps } from './StatsView.types';

/**
 * StatsView - Budget vs Actual 進捗ビュー
 *
 * Plan(予算) vs Record(実績) をタグ別に集計し、
 * 週単位の進捗をテーブル形式で表示。
 * サイドバーからタグをクリックして子タグにドリルダウン可能。
 */
export function StatsView({ currentDate, className }: StatsViewProps) {
  const t = useTranslations('calendar.stats');
  const { data, streak, isLoading, weekStart, weekEnd } = useStatsViewData(currentDate);

  if (isLoading) {
    return (
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
          <Skeleton className="mt-4 h-[300px]" />
        </div>
      </div>
    );
  }

  if (!data || (data.tagBreakdown.length === 0 && data.hero.plannedMinutes === 0 && data.hero.actualMinutes === 0)) {
    return (
      <CalendarViewAnimation viewType="agenda">
        <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={BarChart3}
              title={t('emptyTitle')}
              description={t('emptyDescription')}
            />
          </div>
        </div>
      </CalendarViewAnimation>
    );
  }

  return (
    <CalendarViewAnimation viewType="agenda">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        <div className="flex-1 overflow-y-auto">
          {/* Weekly Progress: Hero + Table */}
          <StatsHeroCards hero={data.hero} streak={streak} />
          <StatsTable tagBreakdown={data.tagBreakdown} />

          {/* Charts */}
          <div className="flex flex-col gap-4 p-4">
            <YearlyHeatmap />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TagTimeChart />
              <MonthlyTrendChart />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <HourlyDistributionChart />
              <DayOfWeekChart />
            </div>

            <SleepStatsCard startDate={weekStart} endDate={weekEnd} />
          </div>
        </div>
      </div>
    </CalendarViewAnimation>
  );
}
