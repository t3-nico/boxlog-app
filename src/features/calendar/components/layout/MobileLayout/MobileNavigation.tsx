'use client'

import { useCallback } from 'react'

import { Calendar, Plus, Settings, User } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'
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

/**
 * モバイル用下部ナビゲーション
 * タブバーとFABを組み合わせた設計
 */
export const MobileNavigation = ({
  items,
  activeItem,
  onItemClick,
  showAddButton = true,
  onAddClick,
  className,
}: MobileNavigationProps) => {
  const { t } = useI18n()

  const defaultItems: MobileNavItem[] = [
    {
      id: 'calendar',
      label: t('calendar.mobile.navigation.calendar'),
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'profile',
      label: t('calendar.mobile.navigation.profile'),
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'settings',
      label: t('calendar.mobile.navigation.settings'),
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const navItems = items ?? defaultItems

  const handleItemClick = (item: MobileNavItem) => {
    if (item.disabled) return
    item.onClick?.()
    onItemClick?.(item.id)
  }

  // Dynamic click handler
  const createItemClickHandler = useCallback((item: MobileNavItem) => {
    return () => handleItemClick(item)
  }, [])

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background/95 border-border border-t backdrop-blur-sm',
        'safe-area-inset-bottom', // iOS SafeArea対応
        className
      )}
    >
      <div className="pb-safe relative flex items-center justify-around px-2 py-2">
        {navItems.map((item, _index) => (
          <button
            type="button"
            key={item.id}
            onClick={createItemClickHandler(item)}
            disabled={item.disabled}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'h-12 min-w-[64px] rounded-lg px-2 py-1',
              'transition-colors duration-200',
              'disabled:cursor-not-allowed disabled:opacity-50',
              activeItem === item.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {/* アイコン */}
            <div className="relative">
              {item.icon}
              {/* バッジ */}
              {item.badge && item.badge > 0 ? <div className="bg-destructive text-destructive-foreground absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-xs">
                  {item.badge > 99 ? '99+' : item.badge}
                </div> : null}
            </div>

            {/* ラベル */}
            <span className="mt-0.5 text-xs leading-none">{item.label}</span>

            {/* アクティブインジケーター */}
            {activeItem === item.id && (
              <div className="bg-primary absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
            )}
          </button>
        ))}

        {/* フローティングアクションボタン */}
        {showAddButton != null && (
          <button
            type="button"
            onClick={onAddClick}
            className={cn(
              'absolute -top-6 left-1/2 -translate-x-1/2',
              'bg-primary text-primary-foreground h-14 w-14',
              'rounded-full shadow-lg hover:shadow-xl',
              'flex items-center justify-center',
              'transition-all duration-200 hover:scale-105',
              'border-background border-4'
            )}
            aria-label={t('calendar.mobile.navigation.createEvent')}
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </div>
    </nav>
  )
}
