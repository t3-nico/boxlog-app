import type { Metadata } from 'next';

import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { TagsPageClient } from './tags-page-client';

export const metadata: Metadata = {
  title: 'タグ管理',
  description: 'タグとグループの管理',
};

/**
 * タグ管理ページ
 *
 * Server-side prefetchでtRPCデータを事前取得
 * Note: タグ・グループデータはfetch APIを使用（/api/tags, /api/tag-groups）
 */
export default async function TagsPage() {
  // Server-side prefetch: タグ統計データを事前取得
  const helpers = await createServerHelpers();
  await helpers.plans.getTagStats.prefetch();

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <TagsPageClient />
    </HydrationBoundary>
  );
}
