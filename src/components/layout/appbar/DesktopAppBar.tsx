'use client'

import React, { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { Calendar, SquareKanban, Table, BarChart3, Settings, PanelLeftClose, PanelLeft, LucideIcon } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { useAuthContext } from '@/features/auth'
import { useI18n } from '@/lib/i18n/hooks'
import { cn } from '@/lib/utils'

import { useNavigationStore } from './stores/navigation.store'
import { UserMenu } from './user-menu'
import { AppBarItem } from './appbar-item'

interface AppBarItemData {
  id: string
  labelKey: string
  icon: LucideIcon
  href: string
}

const appBarItems: AppBarItemData[] = [
  { id: 'calendar', labelKey: 'appbar.navigation.calendar', icon: Calendar, href: '/ja/calendar' },
  { id: 'board', labelKey: 'appbar.navigation.board', icon: SquareKanban, href: '/ja/board' },
  { id: 'table', labelKey: 'appbar.navigation.table', icon: Table, href: '/ja/table' },
  { id: 'stats', labelKey: 'appbar.navigation.stats', icon: BarChart3, href: '/ja/stats' },
  { id: 'settings', labelKey: 'appbar.navigation.settings', icon: Settings, href: '/ja/settings' },
]

export const DesktopAppBar = () => {
  const pathname = usePathname() || '/'
  const { user } = useAuthContext()
  const { isSidebarOpen, toggleSidebar } = useNavigationStore()
  const { t } = useI18n()

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  return (
    <div className="flex w-16 flex-col border-r border-border bg-card text-card-foreground">
      {/* Top: Sidebar Toggle Button */}
      <div className="flex items-center justify-center pt-4 pb-2">
        <button
          type="button"
          onClick={handleToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors duration-150 hover:bg-muted"
          aria-label={t('appbar.toggleSidebar')}
        >
          {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col items-center gap-1 py-2">
        {appBarItems.map((item) => {
          const isActive = pathname.startsWith(item.href)

          return (
            <AppBarItem
              key={item.id}
              id={item.id}
              label={t(item.labelKey)}
              icon={item.icon}
              href={item.href}
              isActive={isActive}
            />
          )
        })}
      </nav>

      {/* Bottom: User Avatar */}
      <div className="flex items-center justify-center pb-4">
        <UserMenu>
          <button type="button" className="flex items-center justify-center hover:opacity-80 transition-opacity duration-150">
            {user?.user_metadata?.profile_icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary/10 text-lg">
                {user.user_metadata.profile_icon}
              </div>
            ) : (
              <Avatar
                src={user?.user_metadata?.avatar_url}
                initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                className="h-10 w-10 rounded-full border border-border"
              />
            )}
          </button>
        </UserMenu>
      </div>
    </div>
  )
}
