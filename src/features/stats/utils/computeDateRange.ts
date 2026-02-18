import type { StatsPeriod } from '../stores/useStatsFilterStore';

/**
 * StatsPeriod から startDate/endDate を算出
 *
 * - week: 過去7日
 * - month: 過去30日
 * - year: 過去365日
 * - all: フィルターなし（undefined）
 */
export function computeDateRange(period: StatsPeriod): {
  startDate: string | undefined;
  endDate: string | undefined;
} {
  if (period === 'all') {
    return { startDate: undefined, endDate: undefined };
  }

  const now = new Date();
  const end = now.toISOString();

  const daysMap: Record<Exclude<StatsPeriod, 'all'>, number> = {
    week: 7,
    month: 30,
    year: 365,
  };

  const start = new Date(now);
  start.setDate(start.getDate() - daysMap[period]);
  start.setHours(0, 0, 0, 0);

  return { startDate: start.toISOString(), endDate: end };
}

/**
 * StatsPeriod から MonthlyTrend の月数を算出
 */
export function computeMonthCount(period: StatsPeriod): number | undefined {
  switch (period) {
    case 'week':
      return 1;
    case 'month':
      return 3;
    case 'year':
      return 12;
    case 'all':
      return undefined;
  }
}
