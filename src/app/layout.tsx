// app/layout.tsx（最終版）
import '@/styles/globals.css'

import type { ErrorInfo } from 'react'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from '@/components/common'
import GlobalErrorBoundary from '@/components/common/GlobalErrorBoundary'
import { cn } from '@/lib/utils'
import { ToastContainer } from '@/lib/toast'

// next/font による最適化されたフォント読み込み
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// グローバルエラーハンドラー
const handleGlobalError = (error: Error, errorInfo: ErrorInfo, retryCount: number) => {
  // エラー監視サービス（Sentry等）への送信
  console.error('Global Error Caught:', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    retryCount,
    timestamp: new Date().toISOString(),
  })
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    template: '%s - BoxLog',
    default: 'BoxLog',
  },
  description: 'BoxLog - Box management application',
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={cn('bg-neutral-100 dark:bg-neutral-900')}>
        <GlobalErrorBoundary maxRetries={3} retryDelay={1000} onError={handleGlobalError}>
          <Providers>
            {children}
            <ToastContainer />
          </Providers>
        </GlobalErrorBoundary>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}

export default RootLayout
