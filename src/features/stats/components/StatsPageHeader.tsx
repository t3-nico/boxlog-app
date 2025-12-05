'use client'

import { useTranslations } from 'next-intl'

import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton'

/**
 * 統計ページメインコンテンツヘッダー
 *
 * SidebarHeaderと同じ仕様:
 * - 高さ: 48px固定（8px top padding + 40px container）
 * - 横幅パディング: 16px
 * - 背景: bg-background
 */
export function StatsPageHeader() {
  const t = useTranslations()

  return (
    <div className="bg-background flex h-12 shrink-0 items-end px-4 pt-2">
      {/* モバイル: ハンバーガーメニュー */}
      <MobileMenuButton className="mr-2 md:hidden" />

      {/* タイトルコンテナ（40px） */}
      <div className="flex h-10 flex-1 items-center gap-1 overflow-hidden">
        <h1 className="truncate text-base font-semibold">{t('stats.page.title')}</h1>
      </div>
    </div>
  )
}
