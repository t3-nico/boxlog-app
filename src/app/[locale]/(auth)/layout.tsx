/**
 * 認証ページ用レイアウト
 *
 * @description
 * 認証ページ（/auth/login, /auth/signup等）で使用。
 * 軽量なPublicProvidersのみを適用し、tRPC、Realtime購読等の
 * 重い機能は含まない。
 *
 * これにより、DB接続やAPI接続に問題があっても
 * 認証ページは正常に表示・動作する。
 *
 * Provider階層:
 * 1. PublicProviders（Theme, Tooltip のみ）
 * 2. AuthLayout（認証UI用レイアウト）
 *
 * @see src/components/providers/PublicProviders.tsx - 軽量Providers定義
 */
'use client'

import { PublicProviders } from '@/components/providers/PublicProviders'
import { Toaster } from '@/components/ui/sonner'
import { AuthLayout } from '@/features/auth'
import { RecaptchaScript } from '@/lib/recaptcha'

const AuthRootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <PublicProviders>
      <RecaptchaScript />
      <AuthLayout>{children}</AuthLayout>
      <Toaster />
    </PublicProviders>
  )
}

export default AuthRootLayout
