import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { RecordContent } from './record-content';

/**
 * Record ページ
 *
 * Server-side prefetchでデータを事前取得
 */
export default async function RecordPage() {
  // Server-side prefetch: クライアントでのデータ取得を高速化
  const helpers = await createServerHelpers();
  await Promise.all([helpers.records.list.prefetch({}), helpers.records.getRecent.prefetch({})]);

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <RecordContent />
    </HydrationBoundary>
  );
}
