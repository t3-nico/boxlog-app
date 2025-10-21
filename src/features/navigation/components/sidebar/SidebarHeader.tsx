'use client'

import { PanelLeftClose } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'

import type { SidebarHeaderProps } from './types'

/**
 * Sidebarヘッダーコンポーネント
 *
 * - タイトル表示
 * - 閉じるボタン（AppBarと同じデザイン）
 *
 * **デザイン仕様**:
 * - 高さ: 48px (min-h-12)
 * - スペーシング: px-2, gap-2
 * - AppBarとの整合性: 同じ閉じるボタンスタイル
 */
export function SidebarHeader({ title }: SidebarHeaderProps) {
  const { close } = useSidebarStore()
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  return (
    <div className="flex h-12 items-center justify-between px-2">
      {/* タイトル */}
      <h2 className="text-base font-semibold">{title}</h2>

      {/* 閉じるボタン */}
      <Button
        onClick={close}
        size="icon"
        variant="ghost"
        aria-label={t('sidebar.closeSidebar')}
        className="text-muted-foreground hover:text-foreground size-8 shrink-0"
      >
        <PanelLeftClose className="size-4" />
      </Button>
    </div>
  )
}
