'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavigationItem, isNavItemActive } from '@/config/navigation/config'
import { useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'
import { componentRadius, columns, animations, icons, typography, colors } from '@/config/theme'
import { selection, text, background, secondary } from '@/config/theme/colors'

interface SidebarItemProps {
  item: NavigationItem
  pathname: string
}

export function SidebarItem({ item, pathname }: SidebarItemProps) {
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
        'w-full flex items-center gap-3 px-3 py-2 text-left',
        componentRadius.button.md,
        animations.transition.fast,
        'relative group',
        isActive
          ? `${selection.text} ${selection.DEFAULT}`
          : `bg-transparent ${text.muted} ${selection.hover}`
      )}
    >
      <Icon className={icons.size.lg} />
      <span className="font-medium">{item.label}</span>
      
      {/* Badge */}
      {item.badge && (
        <div className={cn(
          'ml-auto w-5 h-5',
          'bg-destructive text-destructive-foreground text-xs font-medium',
          'flex items-center justify-center',
          componentRadius.badge.pill
        )}>
          {item.badge}
        </div>
      )}
    </button>
  )
}