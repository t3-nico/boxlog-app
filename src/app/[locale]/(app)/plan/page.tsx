import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { PlanContent } from './plan-content';

/**
 * Plan ページ
 *
 * Server-side prefetchでデータを事前取得
 */
export default async function PlanPage() {
  // Server-side prefetch: クライアントでのデータ取得を高速化
  const helpers = await createServerHelpers();
  await Promise.all([
    helpers.plans.list.prefetch({}),
    helpers.plans.getTagStats.prefetch(),
    helpers.tags.list.prefetch(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <PlanContent />
    </HydrationBoundary>
  );
}
