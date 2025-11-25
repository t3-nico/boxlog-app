'use client'

import { StatsToolbar } from '@/features/stats/components/stats-toolbar'

interface StatsLayoutProps {
  children: React.ReactNode
}

/**
 * 統計ページ専用レイアウト
 *
 * 構成:
 * - 共通ツールバー（期間選択・フィルタ・エクスポート）
 * - スクロール可能なメインコンテンツ
 *
 * サイドバーナビゲーションは上位レイアウト（DesktopLayout/MobileLayout）で管理
 */
export default function StatsLayout({ children }: StatsLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      {/* ツールバー（PC・モバイル共通） */}
      <StatsToolbar />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
    </div>
  )
}
