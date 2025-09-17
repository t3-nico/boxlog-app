'use client'

import React from 'react'

import { usePathname, useRouter } from 'next/navigation'

import {
  SquareKanban as BoardIcon,
  Calendar as CalendarIcon,
  Menu as MenuIcon,
  BarChart3 as StatsIcon,
  TableProperties as TableIcon,
} from 'lucide-react'

import { animations, colors, icons, spacing, typography } from '@/config/theme'
import { cn } from '@/lib/utils'

import { useNavigationStore } from '../sidebar/stores/navigation.store'

const { sm } = icons.size

interface BottomNavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<any>
  isActive: (pathname: string) => boolean
}

const bottomNavItems: BottomNavItem[] = [
  {
    id: 'calendar',
    label: 'Calendar',
    href: '/calendar',
    icon: CalendarIcon,
    isActive: (pathname) => pathname.startsWith('/calendar'),
  },
  {
    id: 'board',
    label: 'Board',
    href: '/board',
    icon: BoardIcon,
    isActive: (pathname) => pathname.startsWith('/board'),
  },
  {
    id: 'table',
    label: 'Table',
    href: '/table',
    icon: TableIcon,
    isActive: (pathname) => pathname.startsWith('/table'),
  },
  {
    id: 'stats',
    label: 'Stats',
    href: '/stats',
    icon: StatsIcon,
    isActive: (pathname) => pathname.startsWith('/stats'),
  },
]

export const MobileBottomNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { toggleSidebar } = useNavigationStore()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleMenuClick = () => {
    toggleSidebar()
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'flex items-center',
        spacing.height.navigation, // 64px height
        colors.background.surface,
        colors.border.default,
        'border-t'
      )}
    >
      {/* Navigation Items */}
      {bottomNavItems.map((item) => {
        const Icon = item.icon
        const isActive = item.isActive(pathname)

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigation(item.href)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center',
              'h-full px-1 py-2',
              animations.transition.fast,
              colors.hover.subtle
            )}
          >
            <Icon className={cn(sm, 'mb-1', isActive ? colors.text.primary : colors.text.muted)} />
            <span
              className={cn(
                typography.body.small,
                typography.body.xs,
                'leading-tight',
                isActive ? `${colors.text.primary} font-medium` : colors.text.muted
              )}
            >
              {item.label}
            </span>
          </button>
        )
      })}

      {/* Menu Button */}
      <button
        type="button"
        onClick={handleMenuClick}
        className={cn(
          'flex flex-1 flex-col items-center justify-center',
          'h-full px-1 py-2',
          animations.transition.fast,
          colors.hover.subtle
        )}
      >
        <MenuIcon className={cn(sm, 'mb-1', colors.text.muted)} />
        <span className={cn(typography.body.xs, 'leading-tight', colors.text.muted)}>Menu</span>
      </button>
    </div>
  )
}
