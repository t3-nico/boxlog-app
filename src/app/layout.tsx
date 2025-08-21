// app/layout.tsx（最終版）
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/common'
import { background } from '@/config/theme/colors'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    template: '%s - BoxLog',
    default: 'BoxLog',
  },
  description: 'BoxLog - Box management application',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning  // darkクラスは削除（Providersが管理）
    >
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className={background.base}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}