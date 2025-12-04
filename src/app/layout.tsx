// app/layout.tsx - ルートレイアウト（i18n対応）
import '@/styles/globals.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import { Suspense } from 'react'

import { Providers } from '@/components/providers'
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
          <Providers>{children}</Providers>
          <WebVitalsReporter />
          <SpeedInsights />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
