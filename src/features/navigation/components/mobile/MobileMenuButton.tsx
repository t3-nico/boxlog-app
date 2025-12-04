'use client'

import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { useTranslations } from 'next-intl'

/**
 * モバイル用ハンバーガーメニューボタン
 *
 * 各ページのヘッダー/ツールバーに配置してSidebarを開閉する
 *
 * @example
 * ```tsx
 * // Calendar Toolbar
 * <div className="flex items-center gap-2">
 *   <MobileMenuButton className="md:hidden" />
 *   <h1>カレンダー</h1>
 * </div>
 * ```
 */
export function MobileMenuButton({ className }: { className?: string }) {
  const toggle = useSidebarStore((state) => state.toggle)
  const t = useTranslations()

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={t('aria.openMenu')} className={className}>
      <Menu className="size-5" />
    </Button>
  )
}
