'use client'

import { useRouter } from 'next/navigation'

import { NavigationItem, isNavItemActive } from '@/config/navigation/config'
import { useGlobalSearch } from '@/features/search'
import { cn } from '@/lib/utils'

interface AppBarItemProps {
  item: NavigationItem
  pathname: string
  onItemClick?: () => void // AppBarを閉じるコールバック
}

export const AppBarItem = ({ item, pathname, onItemClick }: AppBarItemProps) => {
  const router = useRouter()
  const { open: openGlobalSearch } = useGlobalSearch()
  const Icon = item.icon
  const isActive = isNavItemActive(item, pathname)

  const handleClick = () => {
    if (item.id === 'search') {
      openGlobalSearch()
    } else {
      router.push(item.href)
    }

    // ページクリック時にAppBarを閉じる
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-3 p-2 text-left',
        'rounded-md',
        'transition-colors duration-150',
        'group relative',
        isActive
          ? 'text-white dark:text-white bg-primary hover:bg-primary/90'
          : 'bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={cn('font-medium', 'text-base')}>{item.label}</span>

      {/* Badge */}
      {item.badge != null && (
        <div
          className={cn(
            'ml-auto h-5 w-5',
            'bg-destructive text-destructive-foreground text-xs font-medium',
            'flex items-center justify-center',
            'rounded-full'
          )}
        >
          {item.badge}
        </div>
      )}
    </button>
  )
}
