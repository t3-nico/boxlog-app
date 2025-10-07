'use client'

import React, { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { Calendar, SquareKanban, Table, BarChart3, Settings, PanelLeftClose, PanelLeft, LucideIcon } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthContext } from '@/features/auth'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import { useNavigationStore } from '@/features/navigation/stores/navigation.store'
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
    <TooltipProvider delayDuration={300}>
      <div className="flex w-16 flex-col border-r border-border bg-card text-card-foreground">
        {/* Top: Sidebar Toggle Button */}
        <div className="flex items-center justify-center pt-4 pb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggleSidebar}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center',
                  'rounded-sm',
                  'transition-all duration-200',
                  'group',
                  'hover:bg-accent/80 hover:shadow-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'before:absolute before:inset-0 before:rounded-sm',
                  'before:bg-gradient-to-r before:from-transparent before:via-accent/20 before:to-transparent',
                  'before:opacity-0 hover:before:opacity-100',
                  'before:transition-opacity before:duration-300'
                )}
                aria-label={t('appbar.toggleSidebar')}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="relative z-10 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <PanelLeft className="relative z-10 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>{isSidebarOpen ? t('appbar.closeSidebar') : t('appbar.openSidebar')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

      {/* Navigation Items */}
      <nav
        className="flex flex-1 flex-col items-center gap-1 py-2"
        aria-label={t('appbar.mainNavigation')}
        role="navigation"
      >
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
          <Tooltip>
            <TooltipTrigger asChild>
              <UserMenu>
                <button
                  type="button"
                  className={cn(
                    'relative flex items-center justify-center',
                    'rounded-full',
                    'transition-all duration-200',
                    'group',
                    'hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'before:absolute before:inset-0 before:rounded-full',
                    'before:bg-gradient-to-br before:from-accent/30 before:to-transparent',
                    'before:opacity-0 hover:before:opacity-100',
                    'before:transition-opacity before:duration-300'
                  )}
                  aria-label={t('appbar.userMenu')}
                >
                  {user?.user_metadata?.profile_icon ? (
                    <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary/10 text-lg transition-transform duration-200 group-hover:scale-110">
                      {user.user_metadata.profile_icon}
                    </div>
                  ) : (
                    <Avatar
                      src={user?.user_metadata?.avatar_url}
                      initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                      className="relative z-10 h-10 w-10 rounded-full border border-border transition-transform duration-200 group-hover:scale-110"
                    />
                  )}
                </button>
              </UserMenu>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>{user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('appbar.userMenu')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
