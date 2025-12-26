import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { InboxContent } from './inbox-content';

/**
 * Inboxルートページ
 *
 * リダイレクトではなく、直接 all ビューをレンダリング（パフォーマンス最適化）
 * + Server-side prefetchでデータを事前取得
 */
export default async function InboxPage() {
  // Server-side prefetch: クライアントでのデータ取得を高速化
  const helpers = await createServerHelpers();
  await Promise.all([helpers.plans.list.prefetch({}), helpers.plans.getTagStats.prefetch()]);

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <InboxContent />
    </HydrationBoundary>
  );
}
