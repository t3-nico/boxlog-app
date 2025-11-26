/**
 * メンテナンスページ専用レイアウト
 *
 * ルートレイアウト（/app/layout.tsx）の Providers を
 * オーバーライドして、不要な接続（Supabase Realtime等）を防ぐ
 *
 * 注意: このレイアウトは children をそのまま返すだけで、
 * Providers（RealtimeProvider等）は読み込まない
 */

import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Under Maintenance | BoxLog',
  description: 'System is currently under maintenance',
}

interface MaintenanceLayoutProps {
  children: React.ReactNode
}

export default function MaintenanceLayout({ children }: MaintenanceLayoutProps) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="bg-background">{children}</body>
    </html>
  )
}
