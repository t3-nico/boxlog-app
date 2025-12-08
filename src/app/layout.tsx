/**
 * ルートレイアウト
 *
 * @description
 * 最小限の責務のみを持つルートレイアウト。
 * Providersは各Route Groupのレイアウトで適用する。
 *
 * 責務:
 * - グローバルCSS読み込み
 * - フォント設定（Inter, Noto Sans JP）
 * - HTML/body構造
 * - Vercel Analytics/SpeedInsights
 *
 * @see src/app/[locale]/(app)/layout.tsx - 認証必須ページ用Providers
 * @see src/app/[locale]/(auth)/layout.tsx - 認証ページ用Providers
 * @see src/app/[locale]/legal/layout.tsx - 法的文書用Providers
 */
import '@/styles/globals.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import { Suspense } from 'react'

import { WebVitalsReporter } from '@/components/WebVitalsReporter'
import { cn } from '@/lib/utils'

// next/font による最適化されたフォント読み込み（Variable Font: optical size軸有効）
// preload: true でLCP改善（デフォルトでtrueだが明示的に指定）
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  axes: ['opsz'],
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

// 日本語フォント（GAFA方針準拠: Google = Noto Sans JP）
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-jp',
  preload: true,
  fallback: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'sans-serif'],
})

export const metadata: Metadata = {
  title: {
    template: '%s - BoxLog',
    default: 'BoxLog',
  },
  description: 'BoxLog - Task management and productivity application',
}

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale?: string }>
}

const RootLayout = async ({ children, params }: RootLayoutProps) => {
  const resolvedParams = await params
  const locale = resolvedParams?.locale || 'en'
  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className={cn('bg-background')} suppressHydrationWarning>
        <Suspense fallback={null}>
          {children}
          <WebVitalsReporter />
          <SpeedInsights />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
