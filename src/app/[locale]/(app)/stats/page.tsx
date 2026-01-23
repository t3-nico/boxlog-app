import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { StatsContent } from './stats-client';

/**
 * Route Segment Config
 *
 * ユーザー固有のデータを表示するため、常に動的レンダリング
 * （ISRキャッシュは別ユーザーのデータが混在する危険があるため使用不可）
 */
export const dynamic = 'force-dynamic';

/**
 * 統計ページ
 *
 * Server-side prefetchでデータを事前取得
 * チャートはクライアントで遅延ロード（Rechartsが重いため）
 */
export default async function StatsPage() {
  // Server-side prefetch: クライアントでのデータ取得を高速化
  const helpers = await createServerHelpers();
  const currentYear = new Date().getFullYear();

  await Promise.all([
    helpers.plans.list.prefetch({}),
    helpers.plans.getSummary.prefetch(),
    helpers.plans.getStreak.prefetch(),
    helpers.plans.getTotalTime.prefetch(),
    helpers.plans.getTimeByTag.prefetch(),
    helpers.plans.getHourlyDistribution.prefetch(),
    helpers.plans.getDayOfWeekDistribution.prefetch(),
    helpers.plans.getMonthlyTrend.prefetch(),
    helpers.plans.getDailyHours.prefetch({ year: currentYear }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <StatsContent />
    </HydrationBoundary>
  );
}
