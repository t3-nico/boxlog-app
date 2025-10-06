'use client'

import React, { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import {
  Home,
  Calendar,
  SquareKanban,
  Table,
  BarChart3,
  Settings,
  PanelLeftClose,
} from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { useAuthContext } from '@/features/auth'
import { cn } from '@/lib/utils'

import { useNavigationStore } from './stores/navigation.store'
import { UserMenu } from './user-menu'

interface AppBarItemData {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const appBarItems: AppBarItemData[] = [
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/ja/calendar' },
  { id: 'board', label: 'Board', icon: SquareKanban, href: '/ja/board' },
  { id: 'table', label: 'Table', icon: Table, href: '/ja/table' },
  { id: 'stats', label: 'Stats', icon: BarChart3, href: '/ja/stats' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/ja/settings' },
]

export const DesktopAppBar = () => {
  const pathname = usePathname() || '/'
  const { user } = useAuthContext()
  const { toggleSidebar } = useNavigationStore()

  const handleToggleAppBar = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  return (
    <div
      className={cn(
        'flex flex-col border-r',
        'bg-white dark:bg-neutral-800',
        'text-neutral-900 dark:text-neutral-100',
        'border-neutral-200 dark:border-neutral-700'
      )}
      style={{ width: '64px' }}
    >
      {/* Top: Close Button */}
      <div className="flex items-center justify-center pt-4 pb-2">
        <button
          type="button"
          onClick={handleToggleAppBar}
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8',
            'hover:bg-neutral-100 dark:hover:bg-neutral-700',
            'rounded-sm',
            'transition-colors duration-150'
          )}
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col items-center gap-1 py-2">
        {appBarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'w-14 h-14',
                'rounded-lg',
                'transition-all duration-150',
                'group',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </a>
          )
        })}
      </nav>

      {/* Bottom: User Avatar */}
      <div className="flex items-center justify-center pb-4">
        <UserMenu>
          <button
            type="button"
            className={cn(
              'flex items-center justify-center',
              'hover:opacity-80',
              'transition-opacity duration-150'
            )}
          >
            {user?.user_metadata?.profile_icon ? (
              <div
                className={cn(
                  'w-10 h-10',
                  'text-lg',
                  'flex items-center justify-center',
                  'bg-primary/10',
                  'border border-neutral-200 dark:border-neutral-700',
                  'rounded-full'
                )}
              >
                {user.user_metadata.profile_icon}
              </div>
            ) : (
              <Avatar
                src={user?.user_metadata?.avatar_url}
                initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U')
                  .charAt(0)
                  .toUpperCase()}
                className={cn('w-10 h-10', 'border border-neutral-200 dark:border-neutral-700', 'rounded-full')}
              />
            )}
          </button>
        </UserMenu>
      </div>
    </div>
  )
}
