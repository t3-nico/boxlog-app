// app/layout.tsx - ルートレイアウト（i18n対応）
import '@/styles/globals.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import { GlobalErrorBoundary, Providers } from '@/components/common'
import { ToastContainer } from '@/lib/toast'
import { cn } from '@/lib/utils'

// next/font による最適化されたフォント読み込み
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={cn('bg-neutral-100 dark:bg-neutral-900')} suppressHydrationWarning>
        <Suspense fallback={null}>
          <GlobalErrorBoundary maxRetries={3} retryDelay={1000}>
            <Providers>
              {children}
              <ToastContainer />
            </Providers>
          </GlobalErrorBoundary>
          <SpeedInsights />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
