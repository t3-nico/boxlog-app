import { endOfWeek, startOfWeek } from '@/lib/date/core';
import { createServerHelpers, dehydrate } from '@/platform/trpc/server';

/**
 * Stats ビュー用 prefetch
 *
 * デフォルト粒度（week）の日付範囲でデータを事前取得する。
 */
export async function prefetchStatsData() {
  const helpers = await createServerHelpers();

  const now = new Date();
  const dateRange = {
    startDate: startOfWeek(now).toISOString(),
    endDate: endOfWeek(now).toISOString(),
  };

  await Promise.all([
    helpers.entries.getDailyHours.prefetch({ year: now.getFullYear() }),
    helpers.entries.getTimeByTag.prefetch(dateRange),
    helpers.entries.getHourlyDistribution.prefetch(dateRange),
    helpers.entries.getDayOfWeekDistribution.prefetch(dateRange),
    helpers.entries.getMonthlyTrend.prefetch({ months: 3 }),
  ]);

  return { helpers, dehydratedState: dehydrate(helpers.queryClient) };
}
