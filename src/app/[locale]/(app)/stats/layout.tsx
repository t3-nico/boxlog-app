'use client'

import { StatsPageHeader } from '@/features/stats/components/StatsPageHeader'
import { StatsToolbar } from '@/features/stats/components/stats-toolbar'

interface StatsLayoutProps {
  children: React.ReactNode
}

/**
 * 統計ページ専用レイアウト
 *
 * 構成:
 * - ページヘッダー（タイトル + モバイルメニュー）
 * - 共通ツールバー（期間選択・フィルタ・エクスポート）
 * - スクロール可能なメインコンテンツ
 *
 * サイドバーナビゲーションは上位レイアウト（DesktopLayout/MobileLayout）で管理
 */
export default function StatsLayout({ children }: StatsLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      {/* ページヘッダー */}
      <StatsPageHeader />

      {/* ツールバー（PC・モバイル共通） */}
      <StatsToolbar />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6">{children}</div>
    </div>
  )
}
