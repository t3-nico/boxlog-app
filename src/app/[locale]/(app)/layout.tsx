/**
 * 認証必須ページ用レイアウト
 *
 * @description
 * 認証が必要なページ（/calendar, /stats, /settings等）で使用。
 *
 * 責務分離:
 * - このlayout: Providers（データ層）+ BaseLayout（UIシェル）
 * - GlobalOverlays: グローバルダイアログ群（別ファイルに分離）
 * - ClientPageRouter: クライアントサイドページ切り替え
 *
 * @see src/components/providers.tsx - フルProviders定義
 * @see ./_overlays/GlobalOverlays.tsx - グローバルダイアログ群
 */
import { BaseLayout } from '@/components/layout/base-layout';
import { Providers } from '@/components/providers';

import { ClientPageRouter } from './_composition/ClientPageRouter';
import { GlobalOverlays } from './_overlays/GlobalOverlays';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = async ({ children }: AppLayoutProps) => {
  return (
    <Providers>
      <BaseLayout>
        <ClientPageRouter>{children}</ClientPageRouter>
        <GlobalOverlays />
      </BaseLayout>
    </Providers>
  );
};

export default AppLayout;
