// app/layout.tsx（最終版）
import '@/styles/globals.css'


import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'

import { Providers } from '@/components/common'
import { colors } from '@/config/theme'
import { ToastContainer } from '@/lib/toast'

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
    <html
      lang="ja"
      suppressHydrationWarning  // darkクラスは削除（Providersが管理）
    >
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className={colors.background.base}>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}

export default RootLayout