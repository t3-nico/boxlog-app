import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { SettingsLayoutClient } from './layout-client';

/**
 * 設定ページレイアウト（Server Component）
 *
 * Server-side で userSettings を prefetch し、
 * クライアントでのデータ取得を高速化する。
 */
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  // Server-side prefetch: userSettings を事前取得
  const helpers = await createServerHelpers();
  await helpers.userSettings.get.prefetch();

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <SettingsLayoutClient>{children}</SettingsLayoutClient>
    </HydrationBoundary>
  );
}
