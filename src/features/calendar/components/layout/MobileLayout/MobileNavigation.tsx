'use client'

import { Calendar, List, Plus, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MobileNavItem = {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
  onClick?: () => void
  disabled?: boolean
}

interface MobileNavigationProps {
  items?: MobileNavItem[]
  activeItem?: string
  onItemClick?: (itemId: string) => void
  showAddButton?: boolean
  onAddClick?: () => void
  className?: string
}

const defaultItems: MobileNavItem[] = [
  {
    id: 'calendar',
    label: 'カレンダー',
    icon: <Calendar className="h-5 w-5" />
  },
  {
    id: 'profile',
    label: 'プロフィール',
    icon: <User className="h-5 w-5" />
  },
  {
    id: 'settings',
    label: '設定',
    icon: <Settings className="h-5 w-5" />
  }
]

/**
 * モバイル用下部ナビゲーション
 * タブバーとFABを組み合わせた設計
 */
export function MobileNavigation({
  items = defaultItems,
  activeItem,
  onItemClick,
  showAddButton = true,
  onAddClick,
  className
}: MobileNavigationProps) {
  const handleItemClick = (item: MobileNavItem) => {
    if (item.disabled) return
    item.onClick?.()
    onItemClick?.(item.id)
  }

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'bg-background/95 backdrop-blur-sm border-t border-border',
      'safe-area-inset-bottom', // iOS SafeArea対応
      className
    )}>
      <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'min-w-[64px] h-12 px-2 py-1 rounded-lg',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              activeItem === item.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {/* アイコン */}
            <div className="relative">
              {item.icon}
              {/* バッジ */}
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center px-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>
            
            {/* ラベル */}
            <span className="text-xs mt-0.5 leading-none">
              {item.label}
            </span>

            {/* アクティブインジケーター */}
            {activeItem === item.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}

        {/* フローティングアクションボタン */}
        {showAddButton && (
          <button
            onClick={onAddClick}
            className={cn(
              'absolute left-1/2 -translate-x-1/2 -top-6',
              'w-14 h-14 bg-primary text-primary-foreground',
              'rounded-full shadow-lg hover:shadow-xl',
              'flex items-center justify-center',
              'transition-all duration-200 hover:scale-105',
              'border-4 border-background'
            )}
            aria-label="新しいイベントを作成"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </div>
    </nav>
  )
}