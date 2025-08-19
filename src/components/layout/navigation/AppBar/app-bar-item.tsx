'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavigationItem, isNavItemActive } from '@/components/layout/navigation/navigation/config'
import { useCommandPalette } from '@/features/command-palette/hooks/use-command-palette'

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
        'w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
      )}
      title={item.tooltip || item.label}
    >
      <Icon className="w-5 h-5" />
      
      {/* Badge */}
      {item.badge && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
          {item.badge}
        </div>
      )}
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {item.tooltip || item.label}
      </div>
    </button>
  )
}