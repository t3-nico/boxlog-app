'use client'

import React, { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { Bell, PanelLeftClose, Plus, Search } from 'lucide-react'

import { useCreateEventInspector } from '@/components/layout/inspector/hooks/useCreateEventInspector'
import { Avatar } from '@/components/ui/avatar'
import { primaryNavigation } from '@/config/navigation/config'
import { colors, typography, spacing, rounded } from '@/config/ui/theme'
import { useAuthContext } from '@/features/auth'
import { useNotificationModal } from '@/features/notifications'
import { cn } from '@/lib/utils'

import { SidebarItem } from './sidebar-item'
import { useNavigationStore } from './stores/navigation.store'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

export const DesktopSidebar = () => {
  const pathname = usePathname() || '/'
  const { primaryNavWidth, isSidebarOpen, toggleSidebar } = useNavigationStore()
  const setPrimaryNavWidth = useNavigationStore((state) => state.setPrimaryNavWidth)
  const { open: openNotifications, notificationCount } = useNotificationModal()
  const { user } = useAuthContext()
  const { openCreateInspector } = useCreateEventInspector()

  // jsx-no-bind optimization: Sidebar toggle handler
  const handleToggleSidebar = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  // jsx-no-bind optimization: Create event handler
  const handleCreateEvent = useCallback(() => {
    openCreateInspector({
      context: {
        source: 'sidebar',
      },
    })
  }, [openCreateInspector])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      const startX = e.clientX
      const startWidth = useNavigationStore.getState().primaryNavWidth

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth + (e.clientX - startX)

        // 幅制限を直接ここで実装
        const constrainedWidth = Math.max(200, Math.min(480, newWidth))
        setPrimaryNavWidth(constrainedWidth)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [setPrimaryNavWidth]
  )

  // デスクトップでサイドバーが閉じている場合は何も表示しない
  if (!isSidebarOpen) {
    return null
  }

  return (
    <div
      className={cn(
        'relative flex border-r',
        'z-50',
        'bg-white dark:bg-neutral-800',
        'text-neutral-900 dark:text-neutral-100',
        'border-neutral-200 dark:border-neutral-800'
      )}
      style={{ width: `${primaryNavWidth}px` }}
    >
      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Section: Account & Actions */}
        <div
          className={cn(
            'mt-2 flex items-center justify-between px-2',
            'h-8' // 32px height
          )}
        >
          {/* Left: Close Panel Button */}
          <div className="mr-4 flex items-center">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className={cn(
                'h-8',
                'flex w-8 items-center justify-center',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'rounded-sm',
                'transition-colors duration-150',
                'flex-shrink-0'
              )}
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>

          {/* Right: Action Buttons */}
          <div className={cn('flex items-center', 'gap-1')}>
            {/* Search Button */}
            <button
              type="button"
              className={cn(
                'h-8',
                'flex w-8 items-center justify-center',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'rounded-sm',
                'transition-colors duration-150',
                'flex-shrink-0'
              )}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notification Button */}
            <button
              type="button"
              onClick={openNotifications}
              className={cn(
                'h-8',
                'relative flex items-center justify-center',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'rounded-sm',
                'transition-colors duration-150',
                'flex-shrink-0'
              )}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span
                  className={cn(
                    'absolute -right-1 -top-1',
                    'h-4 w-4',
                    'bg-red-500',
                    'text-white',
                    'text-xs',
                    'flex w-8 items-center justify-center',
                    'rounded-full'
                  )}
                >
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Create Button - PC only, rightmost position */}
            <button
              type="button"
              onClick={handleCreateEvent}
              className={cn(
                'h-8',
                'flex w-8 items-center justify-center',
                'bg-primary',
                'hover:bg-primary/90',
                'text-white',
                'rounded-sm',
                'transition-colors duration-150',
                'flex-shrink-0'
              )}
              aria-label="新しいイベントを作成"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* All Navigation Items */}
        <div
          className={cn(
            'flex flex-1 flex-col space-y-0',
            'px-2 py-2' // 8px horizontal and vertical padding
          )}
        >
          {primaryNavigation.map((section) => (
            <React.Fragment key={section.id}>
              {section.label != null && (
                <div
                  className={cn(
                    'p-2',
                    'mt-4 first:mt-0', // 16px top margin
                    'text-sm',
                    'font-medium uppercase tracking-wider',
                    'text-neutral-600 dark:text-neutral-400'
                  )}
                >
                  {section.label}
                </div>
              )}
              {section.items.length > 0
                ? section.items.map((item) => <SidebarItem key={item.id} item={item} pathname={pathname} />)
                : section.id === 'smart-folders' && (
                    <div className={cn('p-2')}>
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center',
                          'gap-1',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                          'rounded-sm',
                          'transition-colors duration-150',
                          'p-2',
                          'text-neutral-600 dark:text-neutral-400',
                          'text-sm'
                        )}
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add smart folder</span>
                      </button>
                    </div>
                  )}
            </React.Fragment>
          ))}
        </div>

        {/* Theme Toggle */}
        <div
          className={cn(
            'px-2 pb-4' // 16px bottom padding, 8px horizontal padding
          )}
        >
          <div className={cn('flex items-center justify-start')}>
            <ThemeToggle />
          </div>
        </div>

        {/* Bottom Section: User Account */}
        <div
          className={cn(
            'mb-2 px-2' // 8px bottom margin, 8px horizontal padding
          )}
        >
          {/* User Account Info */}
          <UserMenu>
            <div
              className={cn(
                'flex w-full cursor-pointer items-center',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'gap-2', // 8px gap
                'rounded-md',
                'transition-colors duration-150',
                'p-2', // 全方向8px
                'border border-transparent'
              )}
            >
              {/* Avatar Icon Only */}
              <div className="flex-shrink-0">
                {user?.user_metadata?.profile_icon ? (
                  <div
                    className={cn(
                      'w-8 h-8',
                      'text-sm',
                      'flex items-center justify-center',
                      'bg-green-500/10',
                      'border border-gray-200 dark:border-gray-700',
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
                    className={cn('w-8 h-8', 'border border-gray-200 dark:border-gray-700', 'rounded-full')}
                  />
                )}
              </div>

              <div className={cn('flex min-w-0 flex-1 flex-col justify-center')}>
                <div className={cn('truncate', 'text-gray-900 dark:text-gray-100', 'text-base', 'font-medium')}>
                  tomoya
                </div>
                <div className={cn('truncate', 'text-gray-500 dark:text-gray-400', 'text-sm')}>Free Plan</div>
              </div>
            </div>
          </UserMenu>
        </div>
      </div>

      {/* Border Hover & Resize Area */}
      <div
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
          }
        }}
        className={cn('group absolute -right-1 top-0 h-full w-3 cursor-ew-resize')}
        role="button"
        tabIndex={0}
        aria-label="サイドバーの幅を調整"
      >
        {/* Visual Color Change - 1px width */}
        <div
          className={cn(
            'absolute right-1 top-0 h-full w-px transition-colors',
            'bg-blue-500',
            'hover:bg-blue-600'
          )}
        />
      </div>
    </div>
  )
}
