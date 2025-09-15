'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { PanelLeftClose, Bell, Plus, Search } from 'lucide-react'

import { useCreateEventInspector } from '@/components/layout/inspector/hooks/useCreateEventInspector'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { primaryNavigation } from '@/config/navigation/config'
import { colors, rounded, animations, spacing, icons, typography, layout } from '@/config/theme'
import { useAuthContext } from '@/features/auth'
import { useNotificationModal } from '@/features/notifications'
import { cn } from '@/lib/utils'

import { SidebarItem } from './sidebar-item'
import { useNavigationStore } from './stores/navigation.store'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'



const { xs } = layout.heights.header
const { sm, lg } = icons.size
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

  const handleMouseDown = (e: React.MouseEvent) => {
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
  }

  // デスクトップでサイドバーが閉じている場合は何も表示しない
  if (!isSidebarOpen) {
    return null
  }
  
  return (
    <div 
      className={cn(
        'flex relative border-r',
        'z-50',
        colors.background.surface,
        colors.text.primary,
        colors.border.default
      )}
      style={{ width: `${primaryNavWidth}px` }}
    >
      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Section: Account & Actions */}
        <div className={cn(
          'flex items-center justify-between',
          spacing.margin.top.sm,
          headerHeight, // 32px height
          spacing.padding.horizontal.sm // 8px horizontal padding
        )}>
          {/* Left: Close Panel Button */}
          <div className="flex items-center mr-4">
            <button
              onClick={() => toggleSidebar()}
              className={cn(
                spacing.size.button.sm,
                'flex items-center justify-center',
                colors.hover.subtle,
                rounded.component.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <PanelLeftClose className={iconSm} />
            </button>
          </div>
          
          {/* Right: Action Buttons */}
          <div className={cn('flex items-center', spacing.gap.xs)}>
            {/* Search Button */}
            <button
              className={cn(
                spacing.size.button.sm,
                'flex items-center justify-center',
                colors.hover.subtle,
                rounded.component.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <Search className={iconSm} />
            </button>
            
            {/* Notification Button */}
            <button
              onClick={openNotifications}
              className={cn(
                spacing.size.button.sm,
                'flex items-center justify-center relative',
                colors.hover.subtle,
                rounded.component.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <Bell className={iconSm} />
              {notificationCount > 0 && (
                <span className={cn(
                  'absolute -top-1 -right-1',
                  spacing.size.badge.sm,
                  colors.semantic.error.bg,
                  colors.text.onError,
                  typography.body.xs,
                  'flex items-center justify-center',
                  rounded.component.badge.pill
                )}>
                  {notificationCount}
                </span>
              )}
            </button>
            
            {/* Create Button - PC only, rightmost position */}
            <button
              onClick={() => openCreateInspector({
                context: {
                  source: 'sidebar'
                }
              })}
              className={cn(
                spacing.size.button.sm,
                'flex items-center justify-center',
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
        <div className={cn(
          'flex flex-col space-y-0 flex-1',
          spacing.padding.horizontal.sm, // 8px horizontal padding
          spacing.padding.vertical.sm // 8px vertical padding
        )}>
          {primaryNavigation.map((section) => (
            <React.Fragment key={section.id}>
              {section.label && (
                <div className={cn(
                  spacing.padding.sm,
                  spacing.margin.top.md, 'first:mt-0',
                  typography.body.small,
                  'font-medium uppercase tracking-wider',
                  colors.text.muted
                )}>
                  {section.label}
                </div>
              )}
              {section.items.length > 0 ? (
                section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    pathname={pathname}
                  />
                ))
              ) : (
                section.id === 'smart-folders' && (
                  <div className={cn(spacing.padding.sm)}>
                    <button className={cn(
                      'w-full flex items-center',
                      spacing.gap.xs,
                      colors.hover.subtle,
                      rounded.component.button.sm,
                      animations.transition.fast,
                      spacing.padding.sm,
                      colors.text.muted,
                      typography.body.small
                    )}>
                      <Plus className={iconSm} />
                      <span>Add smart folder</span>
                    </button>
                  </div>
                )
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className={cn(
          spacing.padding.bottom.md,
          spacing.padding.horizontal.sm // 8px horizontal padding
        )}>
          <div className={cn(
            'flex items-center justify-start'
          )}>
            <ThemeToggle />
          </div>
        </div>

        {/* Bottom Section: User Account */}
        <div className={cn(
          spacing.margin.bottom.sm, // 8px bottom margin
          spacing.padding.horizontal.sm // 8px horizontal padding
        )}>
          {/* User Account Info */}
          <UserMenu>
            <div className={cn(
              "flex items-center cursor-pointer w-full",
              colors.hover.subtle,
              spacing.gap.sm, // 8px gap
              rounded.component.button.md,
              animations.transition.fast,
              spacing.padding.sm, // 全方向8px
              'border border-transparent'
            )}>
              {/* Avatar Icon Only */}
              <div className="flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <Avatar 
                    src={user.user_metadata.avatar_url} 
                    className={cn(
                      iconLg, 'border',
                      colors.border.default,
                      rounded.component.avatar.md
                    )}
                  />
                ) : user?.user_metadata?.profile_icon ? (
                  <div className={cn(
                    iconLg, typography.body.sm, 'flex items-center justify-center',
                    colors.background.accent, 'border',
                    colors.border.default,
                    rounded.component.avatar.md
                  )}>
                    {user.user_metadata.profile_icon}
                  </div>
                ) : (
                  <Avatar 
                    src={undefined}
                    className={cn(
                      iconLg, 'border',
                      colors.border.default,
                      rounded.component.avatar.md
                    )}
                    initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                  />
                )}
              </div>
              
              <div className={cn(
                'min-w-0 flex-1 flex flex-col justify-center'
              )}>
                <div className={cn(
                  'truncate',
                  colors.text.primary,
                  typography.body.DEFAULT,
                  'font-medium'
                )}>
                  tomoya
                </div>
                <div className={cn(
                  'truncate',
                  colors.text.muted,
                  typography.body.small
                )}>
                  Free Plan
                </div>
              </div>
            </div>
          </UserMenu>
        </div>
      </div>
      
      {/* Border Hover & Resize Area */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute -right-1 top-0 w-3 h-full cursor-ew-resize group'
        )}
      >
        {/* Visual Color Change - 1px width */}
        <div className={cn(
          'absolute right-1 top-0 w-px h-full transition-colors',
          colors.primary.DEFAULT,
          colors.primary.hover
        )} />
      </div>
    </div>
  )
}