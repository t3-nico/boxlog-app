// app/layout.tsx - ルートレイアウト（i18n対応）
import '@/styles/globals.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import { Suspense } from 'react'

import { CookieConsentBanner, GlobalErrorBoundary } from '@/components/common'
import { Providers } from '@/components/providers'
import { WebVitalsReporter } from '@/components/WebVitalsReporter'
import { cn } from '@/lib/utils'

// next/font による最適化されたフォント読み込み（Variable Font: optical size軸有効）
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  axes: ['opsz'],
})

// 日本語フォント（GAFA方針準拠: Google = Noto Sans JP）
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-jp',
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
  params: { locale?: string }
}

const RootLayout = ({ children, params }: RootLayoutProps) => {
  const locale = params?.locale || 'en'
  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className={cn('bg-background')} suppressHydrationWarning>
        <Suspense fallback={null}>
          <GlobalErrorBoundary maxRetries={3} retryDelay={1000}>
            <Providers>
              {children}
              <CookieConsentBanner />
            </Providers>
          </GlobalErrorBoundary>
          <WebVitalsReporter />
          <SpeedInsights />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
