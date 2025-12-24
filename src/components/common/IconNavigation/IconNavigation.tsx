'use client'

import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HoverTooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface IconNavigationItem {
  /** アイコン */
  icon: LucideIcon
  /** ツールチップに表示するラベル */
  label: string
  /** クリック時のコールバック */
  onClick: () => void
  /** アクティブ状態かどうか */
  isActive?: boolean
  /** バッジ表示（フィルター数など） */
  badge?: number
}

export interface IconNavigationProps {
  /** ナビゲーションアイテム */
  items: IconNavigationItem[]
  /** 追加のクラス名 */
  className?: string
}

/**
 * Notion風アイコンナビゲーション
 *
 * 検索・ソート・設定などのアクションをアイコンで提供
 * モバイル・PC両対応
 *
 * **デザイン仕様:**
 * - アイコンサイズ: 20px (size-5)
 * - ボタンサイズ: 32px (size-8)
 * - 8pxグリッドシステム準拠
 *
 * @example
 * ```tsx
 * import { IconNavigation } from '@/components/common'
 * import { Search, ArrowUpDown, Settings } from 'lucide-react'
 *
 * <IconNavigation
 *   items={[
 *     { icon: Search, label: '検索', onClick: () => openSearch() },
 *     { icon: ArrowUpDown, label: 'ソート', onClick: () => openSort() },
 *     { icon: Settings, label: '設定', onClick: () => openSettings() },
 *   ]}
 * />
 * ```
 */
export function IconNavigation({ items, className }: IconNavigationProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <HoverTooltip key={item.label} content={item.label} side="bottom">
            <Button
              variant="ghost"
              size="icon"
              onClick={item.onClick}
              aria-label={item.label}
              className={cn(
                'text-muted-foreground hover:text-foreground relative size-8',
                item.isActive && 'text-foreground bg-state-selected'
              )}
            >
              <Icon className="size-5" />
              {item.badge != null && item.badge > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Button>
          </HoverTooltip>
        )
      })}
    </div>
  )
}
