'use client'

import React from 'react'

import { useRouter } from 'next/navigation'

import { NavigationItem, isNavItemActive } from '@/config/navigation/config'
import { rounded, animations, icons, typography, colors } from '@/config/theme'
import { useGlobalSearch } from '@/features/search'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  item: NavigationItem
  pathname: string
  onItemClick?: () => void // Sidebarを閉じるコールバック
}

export const SidebarItem = ({ item, pathname, onItemClick }: SidebarItemProps) => {
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
    
    // ページクリック時にSidebarを閉じる
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 text-left',
        rounded.component.button.md,
        animations.transition.fast,
        'relative group',
        isActive
          ? `${colors.text.onPrimary} ${colors.primary.DEFAULT}`
          : `bg-transparent ${colors.text.muted} ${colors.hover.subtle}`
      )}
    >
      <Icon className={icons.size.md} />
      <span className={cn("font-medium", typography.heading.h5)}>{item.label}</span>
      
      {/* Badge */}
      {item.badge && (
        <div className={cn(
          'ml-auto w-5 h-5',
          'bg-destructive text-destructive-foreground text-xs font-medium',
          'flex items-center justify-center',
          rounded.component.badge.pill
        )}>
          {item.badge}
        </div>
      )}
    </button>
  )
}