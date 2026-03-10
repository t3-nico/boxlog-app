import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from '@/lib/date/core';

import type { StatsGranularity } from '../stores/useStatsFilterStore';

/**
 * 基準日と粒度から絶対的な日付範囲を算出
 */
export function computeStatsDateRange(
  currentDate: Date,
  granularity: StatsGranularity,
): {
  startDate: string;
  endDate: string;
} {
  switch (granularity) {
    case 'day': {
      return {
        startDate: startOfDay(currentDate).toISOString(),
        endDate: endOfDay(currentDate).toISOString(),
      };
    }
    case 'week': {
      return {
        startDate: startOfWeek(currentDate).toISOString(),
        endDate: endOfWeek(currentDate).toISOString(),
      };
    }
    case 'month': {
      return {
        startDate: startOfMonth(currentDate).toISOString(),
        endDate: endOfMonth(currentDate).toISOString(),
      };
    }
    case 'year': {
      const year = currentDate.getFullYear();
      const start = new Date(year, 0, 1, 0, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    }
  }
}

/**
 * 粒度から MonthlyTrend の月数を算出
 */
export function computeMonthCount(granularity: StatsGranularity): number | undefined {
  switch (granularity) {
    case 'day':
      return 1;
    case 'week':
      return 3;
    case 'month':
      return 12;
    case 'year':
      return undefined;
  }
}
