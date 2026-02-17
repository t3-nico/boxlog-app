'use client';

import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext';

import { useStatsViewData } from '../hooks/useStatsViewData';
import { SleepStatsCard } from './charts/SleepStatsCard';
import { StatsHeroCards } from './StatsHeroCards';
import { StatsTable } from './StatsTable';

/**
 * アサイド用 Stats パネル
 *
 * カレンダーの currentDate に連動した週次進捗を表示:
 * - Hero Cards（Progress / vs Last Week / Streak）
 * - Tag Table（タグ別 Plan vs Done）
 * - Sleep Stats（スケジュール有効時のみ）
 */
export function StatsPanel() {
  const t = useTranslations('calendar.stats');
  const navigation = useCalendarNavigation();
  const currentDate = navigation?.currentDate ?? new Date();

  const { data, streak, isLoading, weekStart, weekEnd } = useStatsViewData(currentDate);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
          </div>
          <Skeleton className="mt-4 h-[200px]" />
        </div>
      </div>
    );
  }

  if (
    !data ||
    (data.tagBreakdown.length === 0 &&
      data.hero.plannedMinutes === 0 &&
      data.hero.actualMinutes === 0)
  ) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={BarChart3}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <StatsHeroCards hero={data.hero} streak={streak} vertical />
        <StatsTable tagBreakdown={data.tagBreakdown} />
        <div className="p-4 pt-0">
          <SleepStatsCard startDate={weekStart} endDate={weekEnd} />
        </div>
      </div>
    </div>
  );
}
