'use client'

import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton'

interface StatsPageHeaderProps {
  title: string
  subtitle?: string
}

/**
 * 統計ページメインコンテンツヘッダー
 *
 * SidebarHeaderと同じ仕様:
 * - 高さ: 48px固定（8px top padding + 40px container）
 * - 横幅パディング: 16px
 * - 背景: bg-background
 */
export function StatsPageHeader({ title, subtitle }: StatsPageHeaderProps) {
  return (
    <div className="bg-background flex h-12 shrink-0 items-end px-4 pt-2">
      {/* モバイル: ハンバーガーメニュー */}
      <MobileMenuButton className="mr-2 md:hidden" />

      {/* タイトルコンテナ（40px） */}
      <div className="flex h-10 flex-1 items-center gap-2 overflow-hidden">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle && (
          <span className="text-muted-foreground truncate text-sm">{subtitle}</span>
        )}
      </div>
    </div>
  )
}
