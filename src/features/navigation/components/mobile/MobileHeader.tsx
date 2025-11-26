'use client'

import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  /** ページタイトル */
  title: string
  /** 右側のアクションボタン */
  actions?: React.ReactNode
  /** ハンバーガーメニューを表示するか（デフォルト: true） */
  showMenuButton?: boolean
  /** 追加のクラス名 */
  className?: string
}

/**
 * モバイル用ヘッダー
 *
 * **構成**:
 * - 左: ハンバーガーメニュー（Sidebar開閉）
 * - 中央: ページタイトル
 * - 右: コンテキストボタン（ページごとに異なる）
 *
 * **デザイン仕様**:
 * - 高さ: 48px（h-12）
 * - 8pxグリッドシステム準拠
 * - セマンティックトークン使用
 */
export function MobileHeader({ title, actions, showMenuButton = true, className }: MobileHeaderProps) {
  const { toggle } = useSidebarStore()

  return (
    <header
      className={cn('bg-background border-border flex h-12 shrink-0 items-center gap-2 border-b px-2', className)}
    >
      {/* Left: Hamburger Menu */}
      {showMenuButton ? (
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="メニューを開く" className="size-10">
          <Menu className="size-5" />
        </Button>
      ) : (
        <div className="w-10" /> // スペーサー
      )}

      {/* Center: Page Title */}
      <h1 className="flex-1 truncate text-center text-base font-semibold">{title}</h1>

      {/* Right: Context Actions */}
      <div className="flex items-center gap-1">{actions ?? <div className="w-10" />}</div>
    </header>
  )
}
