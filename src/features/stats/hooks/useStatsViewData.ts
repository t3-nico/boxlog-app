import { useMemo } from 'react';

import { endOfWeek, startOfWeek } from '@/lib/date/core';
import { formatDateISO } from '@/lib/date/format';
import { api } from '@/lib/trpc';

/**
 * StatsView 用データフック
 *
 * currentDate から週の範囲を算出し、tRPC でデータを取得。
 * 前週のデータも同時に取得して比較に使用。
 */
export function useStatsViewData(currentDate: Date) {
  const { dateRange, weekStart, weekEnd } = useMemo(() => {
    const ws = startOfWeek(currentDate);
    const we = endOfWeek(currentDate);
    const prevWeekStart = startOfWeek(new Date(ws.getTime() - 7 * 24 * 60 * 60 * 1000));
    const prevWeekEnd = endOfWeek(prevWeekStart);

    return {
      dateRange: {
        startDate: formatDateISO(ws),
        endDate: formatDateISO(we),
        prevStartDate: formatDateISO(prevWeekStart),
        prevEndDate: formatDateISO(prevWeekEnd),
        todayDate: formatDateISO(new Date()),
      },
      weekStart: ws,
      weekEnd: we,
    };
  }, [currentDate]);

  const statsQuery = api.plans.getStatsViewData.useQuery(dateRange);
  const streakQuery = api.plans.getStreak.useQuery();

  return {
    data: statsQuery.data ?? null,
    streak: streakQuery.data ?? null,
    isLoading: statsQuery.isLoading || streakQuery.isLoading,
    error: statsQuery.error ?? streakQuery.error ?? null,
    weekStart,
    weekEnd,
  };
}
