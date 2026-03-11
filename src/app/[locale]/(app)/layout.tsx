/**
 * 認証必須ページ用レイアウト
 *
 * @description
 * 認証が必要なページ（/plan, /calendar, /stats等）で使用。
 * フルProvidersを適用し、tRPC、Realtime購読、GlobalSearch等の
 * 全機能を利用可能にする。
 *
 * Provider階層:
 * 1. Providers（QueryClient, tRPC, Auth, Realtime, Theme, GlobalSearch）
 * 2. BaseLayout（サイドバー、ヘッダー）
 *
 * @see src/components/providers.tsx - フルProviders定義
 */
import { BaseLayout } from '@/components/layout/base-layout';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toast';
import {
  EntryDeleteConfirmDialog,
  EntryInspector,
  RecurringEditConfirmDialog,
} from '@/features/entry/components';

import { ClientPageRenderer } from './_composition/ClientPageRenderer';

interface AppLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

const AppLayout = async ({ children, modal }: AppLayoutProps) => {
  return (
    <Providers>
      <BaseLayout>
        <ClientPageRenderer>{children}</ClientPageRenderer>
        {modal}
        <EntryInspector />
        <EntryDeleteConfirmDialog />
        <RecurringEditConfirmDialog />
        <Toaster />
      </BaseLayout>
    </Providers>
  );
};

export default AppLayout;
