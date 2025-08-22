'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavigationItem, isNavItemActive } from '@/config/navigation/config'
import { useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'
import { componentRadius, columns, animations, icons, typography, colors } from '@/config/theme'
import { selection, text, background, secondary } from '@/config/theme/colors'

interface AppBarItemProps {
  item: NavigationItem
  pathname: string
}

export function AppBarItem({ item, pathname }: AppBarItemProps) {
  const router = useRouter()
  const { open: openCommandPalette } = useCommandPalette()
  const Icon = item.icon
  const isActive = isNavItemActive(item, pathname)

  const handleClick = () => {
    if (item.id === 'search') {
      openCommandPalette()
    } else {
      router.push(item.href)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        columns.nav.content.item,
        componentRadius.button.md,
        animations.transition.fast,
        'relative group',
        isActive
          ? `${selection.active} ${selection.text}`
          : `bg-transparent ${text.muted} ${selection.hover}`
      )}
    >
      <Icon className={icons.size.lg} />
      
      {/* Badge */}
      {item.badge && (
        <div className={cn(
          'absolute -top-1 -right-1 w-5 h-5',
          'bg-destructive text-destructive-foreground text-xs font-medium',
          'flex items-center justify-center',
          componentRadius.badge.pill
        )}>
          {item.badge}
        </div>
      )}
      
      
      {/* Tooltip */}
      <div className={cn(
        'absolute left-full ml-2 px-2 py-1',
        `${background.surface} text-xs ${text.primary} shadow-lg`,
        'opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50',
        componentRadius.input.text,
        animations.transition.fast
      )}>
        {item.tooltip || item.label}
      </div>
    </button>
  )
}