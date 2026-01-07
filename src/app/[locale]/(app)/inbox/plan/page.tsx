import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { InboxContent } from '../inbox-content';

/**
 * Inbox Plan ページ
 *
 * Plan一覧を表示（Server-side prefetchでデータを事前取得）
 */
export default async function InboxPlanPage() {
  // Server-side prefetch: クライアントでのデータ取得を高速化
  const helpers = await createServerHelpers();
  await Promise.all([helpers.plans.list.prefetch({}), helpers.plans.getTagStats.prefetch()]);

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <InboxContent />
    </HydrationBoundary>
  );
}
