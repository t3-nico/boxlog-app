'use client'

import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/common/PageHeader'
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
  const t = useTranslations()

  return (
    <div className="flex h-full flex-col">
      {/* ページヘッダー */}
      <PageHeader title={t('stats.sidebar.overview')} />

      {/* ツールバー（PC・モバイル共通） */}
      <StatsToolbar />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4">{children}</div>
    </div>
  )
}
