'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Calendar as CalendarIcon,
  SquareKanban as BoardIcon,
  TableProperties as TableIcon,
  BarChart3 as StatsIcon,
  Menu as MenuIcon
} from 'lucide-react'
import { useNavigationStore } from '../sidebar/stores/navigation.store'
import { background, text, border } from '@/config/theme/colors'
import { componentRadius, animations, icon, typography } from '@/config/theme'

const { sm } = icon.size

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
    isActive: (pathname) => pathname.startsWith('/calendar')
  },
  {
    id: 'board',
    label: 'Board',
    href: '/board',
    icon: BoardIcon,
    isActive: (pathname) => pathname.startsWith('/board')
  },
  {
    id: 'table',
    label: 'Table',
    href: '/table',
    icon: TableIcon,
    isActive: (pathname) => pathname.startsWith('/table')
  },
  {
    id: 'stats',
    label: 'Stats',
    href: '/stats',
    icon: StatsIcon,
    isActive: (pathname) => pathname.startsWith('/stats')
  }
]

export function MobileBottomNavigation() {
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
        'h-16', // 64px height
        background.surface,
        border.universal,
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
            onClick={() => handleNavigation(item.href)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center',
              'h-full px-1 py-2',
              animations.transition.fast,
              'active:bg-accent'
            )}
          >
            <Icon 
              className={cn(
                sm, 
                'mb-1',
                isActive ? 'text-blue-600 dark:text-blue-400' : text.muted
              )} 
            />
            <span 
              className={cn(
                typography.body.small,
                'text-xs leading-tight',
                isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : text.muted
              )}
            >
              {item.label}
            </span>
          </button>
        )
      })}
      
      {/* Menu Button */}
      <button
        onClick={handleMenuClick}
        className={cn(
          'flex-1 flex flex-col items-center justify-center',
          'h-full px-1 py-2',
          animations.transition.fast,
          'active:bg-accent'
        )}
      >
        <MenuIcon className={cn(sm, 'mb-1', text.muted)} />
        <span className={cn(typography.body.small, 'text-xs leading-tight', text.muted)}>
          Menu
        </span>
      </button>
    </div>
  )
}