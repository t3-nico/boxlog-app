/**
 * 認証必須ページ用レイアウト
 *
 * @description
 * 認証が必要なページ（/inbox, /calendar, /tags, /stats等）で使用。
 * フルProvidersを適用し、tRPC、Realtime購読、GlobalSearch等の
 * 全機能を利用可能にする。
 *
 * Provider階層:
 * 1. Providers（QueryClient, tRPC, Auth, Realtime, Theme, GlobalSearch）
 * 2. BaseLayout（サイドバー、ヘッダー）
 *
 * @see src/components/providers.tsx - フルProviders定義
 */
import { BaseLayout } from '@/components/layout/base-layout'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { PlanInspector } from '@/features/plans/components'
import { TagInspector } from '@/features/tags/components/inspector'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <BaseLayout>
        {children}
        <PlanInspector />
        <TagInspector />
        <Toaster />
      </BaseLayout>
    </Providers>
  )
}

export default AppLayout
