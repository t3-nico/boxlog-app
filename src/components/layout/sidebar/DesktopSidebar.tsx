'use client'

import React, { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { Bell, PanelLeftClose, Plus, Search } from 'lucide-react'

import { useCreateEventInspector } from '@/components/layout/inspector/hooks/useCreateEventInspector'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { primaryNavigation } from '@/config/navigation/config'
import { animations, colors, ghost, gridGap, icons, layout, rounded, spacing, typography } from '@/config/theme'
import { useAuthContext } from '@/features/auth'
import { useNotificationModal } from '@/features/notifications'
import { cn } from '@/lib/utils'

import { SidebarItem } from './sidebar-item'
import { useNavigationStore } from './stores/navigation.store'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

const { xs: _xs } = layout.heights.header
const { sm: _sm, lg: _lg } = icons.size
// テーマから統一的に取得
const { xs: headerHeight } = layout.heights.header
const { sm: iconSm, lg: iconLg } = icons.size

export const DesktopSidebar = () => {
  const pathname = usePathname()
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
        colors.background.surface,
        colors.text.primary,
        colors.border.default
      )}
      style={{ width: `${primaryNavWidth}px` }}
    >
      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Section: Account & Actions */}
        <div
          className={cn(
            'mt-2 flex items-center justify-between px-2',
            headerHeight // 32px height
          )}
        >
          {/* Left: Close Panel Button */}
          <div className="mr-4 flex items-center">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className={cn(
                layout.heights.button.sm,
                'flex w-8 items-center justify-center',
                ghost.hover,
                rounded.component.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <PanelLeftClose className={iconSm} />
            </button>
          </div>

          {/* Right: Action Buttons */}
          <div className={cn('flex items-center', gridGap.tight)}>
            {/* Search Button */}
            <button
              type="button"
              className={cn(
                layout.heights.button.sm,
                'flex w-8 items-center justify-center',
                ghost.hover,
                rounded.component.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <Search className={iconSm} />
            </button>

            {/* Notification Button */}
            <button
              type="button"
              onClick={openNotifications}
              className={cn(
                layout.heights.button.sm,
                'relative flex items-center justify-center',
                ghost.hover,
                rounded.component.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <Bell className={iconSm} />
              {notificationCount > 0 && (
                <span
                  className={cn(
                    'absolute -right-1 -top-1',
                    spacing.size.badge.sm,
                    colors.semantic.error.bg,
                    colors.text.onError,
                    typography.body.xs,
                    'flex w-8 items-center justify-center',
                    rounded.component.badge.pill
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
                layout.heights.button.sm,
                'flex w-8 items-center justify-center',
                colors.primary.DEFAULT,
                colors.primary.hover,
                colors.text.onPrimary,
                rounded.component.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
              aria-label="新しいイベントを作成"
            >
              <Plus className={iconSm} />
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
                    spacing.padding.sm,
                    'mt-4 first:mt-0', // 16px top margin
                    typography.body.small,
                    'font-medium uppercase tracking-wider',
                    colors.text.muted
                  )}
                >
                  {section.label}
                </div>
              )}
              {section.items.length > 0
                ? section.items.map((item) => <SidebarItem key={item.id} item={item} pathname={pathname} />)
                : section.id === 'smart-folders' && (
                    <div className={cn(spacing.padding.sm)}>
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center',
                          gridGap.tight,
                          ghost.hover,
                          rounded.component.button.sm,
                          animations.transition.fast,
                          spacing.padding.sm,
                          colors.text.muted,
                          typography.body.small
                        )}
                      >
                        <Plus className={iconSm} />
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
                ghost.hover,
                gridGap.default, // 8px gap
                rounded.component.button.md,
                animations.transition.fast,
                spacing.padding.sm, // 全方向8px
                'border border-transparent'
              )}
            >
              {/* Avatar Icon Only */}
              <div className="flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <Avatar
                    src={user.user_metadata.avatar_url}
                    className={cn(iconLg, 'border', colors.border.default, rounded.component.media.avatar)}
                  />
                ) : user?.user_metadata?.profile_icon ? (
                  <div
                    className={cn(
                      iconLg,
                      typography.body.sm,
                      'flex items-center justify-center',
                      colors.background.accent,
                      'border',
                      colors.border.default,
                      rounded.component.media.avatar
                    )}
                  >
                    {user.user_metadata.profile_icon}
                  </div>
                ) : (
                  <Avatar
                    src={undefined}
                    className={cn(iconLg, 'border', colors.border.default, rounded.component.media.avatar)}
                    initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  />
                )}
              </div>

              <div className={cn('flex min-w-0 flex-1 flex-col justify-center')}>
                <div className={cn('truncate', colors.text.primary, typography.body.DEFAULT, 'font-medium')}>
                  tomoya
                </div>
                <div className={cn('truncate', colors.text.muted, typography.body.small)}>Free Plan</div>
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
            colors.primary.DEFAULT,
            colors.primary.hover
          )}
        />
      </div>
    </div>
  )
}
