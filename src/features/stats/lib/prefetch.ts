import { createServerHelpers, dehydrate } from '@/lib/trpc/server';

/**
 * Stats ビュー用 prefetch
 *
 * 統計ビューで使用するデータを事前取得する。
 * カレンダービューとは異なるデータ要件（日付範囲なし、集計データ中心）。
 */
export async function prefetchStatsData() {
  const helpers = await createServerHelpers();

  await Promise.all([
    helpers.entries.getStreak.prefetch(),
    helpers.entries.getDailyHours.prefetch({ year: new Date().getFullYear() }),
    // 以下はデフォルト期間('all')ではinput不要
    helpers.entries.getTimeByTag.prefetch(),
    helpers.entries.getHourlyDistribution.prefetch(),
    helpers.entries.getDayOfWeekDistribution.prefetch(),
    helpers.entries.getMonthlyTrend.prefetch(),
  ]);

  return { helpers, dehydratedState: dehydrate(helpers.queryClient) };
}
