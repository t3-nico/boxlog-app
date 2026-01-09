import type { Metadata } from 'next';

import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { SettingsTagsPageClient } from './settings-tags-page-client';

export const metadata: Metadata = {
  title: 'タグ管理',
  description: 'タグとグループの管理',
};

/**
 * タグ管理ページ（Settings内）
 *
 * Server-side prefetchでtRPCデータを事前取得
 */
export default async function SettingsTagsPage() {
  const helpers = await createServerHelpers();
  await helpers.plans.getTagStats.prefetch();

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <SettingsTagsPageClient />
    </HydrationBoundary>
  );
}
