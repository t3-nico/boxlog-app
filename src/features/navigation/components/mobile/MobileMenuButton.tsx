'use client'

import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'

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
  const { toggle } = useSidebarStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="メニューを開く"
      className={className}
    >
      <Menu className="size-5" />
    </Button>
  )
}
