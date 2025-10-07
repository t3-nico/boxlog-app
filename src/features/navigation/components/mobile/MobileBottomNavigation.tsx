'use client'

import React, { useCallback } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import {
  SquareKanban as BoardIcon,
  Calendar as CalendarIcon,
  Menu as MenuIcon,
  BarChart3 as StatsIcon,
  TableProperties as TableIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { useNavigationStore } from '@/features/navigation/stores/navigation.store'

interface BottomNavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
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

  const handleNavigation = useCallback(
    (href: string) => {
      router.push(href)
    },
    [router]
  )

  const handleMenuClick = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  const createNavigationHandler = useCallback(
    (href: string) => {
      return () => handleNavigation(href)
    },
    [handleNavigation]
  )

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'flex items-center',
        'h-16', // 64px height
        'bg-white dark:bg-neutral-800',
        'border-neutral-200 dark:border-neutral-800',
        'border-t'
      )}
    >
      {/* Navigation Items */}
      {bottomNavItems.map((item) => {
        const Icon = item.icon
        const isActive = item.isActive(pathname ?? '/')

        return (
          <button
            key={item.id}
            type="button"
            onClick={createNavigationHandler(item.href)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center',
              'h-full px-1 py-2',
              'transition-all duration-200',
              'hover:bg-neutral-100 dark:hover:bg-neutral-700'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 mb-1',
                isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'
              )}
            />
            <span
              className={cn(
                'text-xs',
                'leading-tight',
                isActive
                  ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400'
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
          'transition-all duration-200',
          'hover:bg-neutral-100 dark:hover:bg-neutral-700'
        )}
      >
        <MenuIcon className="h-5 w-5 mb-1 text-neutral-600 dark:text-neutral-400" />
        <span className="text-xs leading-tight text-neutral-600 dark:text-neutral-400">Menu</span>
      </button>
    </div>
  )
}
