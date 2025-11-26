'use client'

import { usePathname } from 'next/navigation'

import { Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useMobileHeader } from '@/features/navigation/hooks/useMobileHeader'
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
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] ?? 'ja') as 'ja' | 'en'
  const { t } = useI18n(locale)

  // モバイルヘッダー設定
  useMobileHeader({
    title: t('navigation.stats'),
    actions: (
      <Button variant="ghost" size="icon" className="size-10" aria-label={t('stats.selectPeriod')}>
        <Calendar className="size-5" />
      </Button>
    ),
  })

  return (
    <div className="flex h-full flex-col">
      {/* ツールバー（PC・モバイル共通） */}
      <StatsToolbar />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
    </div>
  )
}
