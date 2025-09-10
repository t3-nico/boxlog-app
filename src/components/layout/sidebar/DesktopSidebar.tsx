'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavigation } from '@/config/navigation/config'
import { SidebarItem } from './sidebar-item'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { useNavigationStore } from './stores/navigation.store'
import { background, text, border } from '@/config/theme/colors'
import { PanelLeftClose, Bell, Plus, Search } from 'lucide-react'
import { useNotificationModal } from '@/features/notifications'
import { componentRadius, animations, spacing, icon, typography } from '@/config/theme'
import { layout } from '@/config/theme/layout'
import { useAuthContext } from '@/features/auth'
import { Avatar } from '@/components/shadcn-ui/avatar'

const { xs } = layout.heights.header
const { sm, lg } = icon.size
const gap1wo = 'gap-1'
const space2 = spacing.space[2]
const px2 = 'px-2'
const py2 = 'py-2'

export function DesktopSidebar() {
  const pathname = usePathname()
  const { primaryNavWidth, isSidebarOpen, toggleSidebar } = useNavigationStore()
  const setPrimaryNavWidth = useNavigationStore((state) => state.setPrimaryNavWidth)
  const { open: openNotifications, notificationCount } = useNotificationModal()
  const { user } = useAuthContext()

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
        'flex relative z-[9999] border-r',
        background.surface,
        text.primary,
        border.universal
      )}
      style={{ width: `${primaryNavWidth}px` }}
    >
      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Section: Account & Actions */}
        <div className={cn(
          'flex items-center justify-between mt-2',
          xs, // 32px height
          px2 // 8px horizontal padding
        )}>
          {/* Left: Close Panel Button */}
          <div className="flex items-center mr-4">
            <button
              onClick={() => toggleSidebar()}
              className={cn(
                'w-8 h-8 flex items-center justify-center hover:bg-accent',
                componentRadius.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <PanelLeftClose className={sm} />
            </button>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <button
              className={cn(
                'w-8 h-8 flex items-center justify-center hover:bg-accent',
                componentRadius.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <Search className={sm} />
            </button>
            
            {/* Notification Button */}
            <button
              onClick={openNotifications}
              className={cn(
                'w-8 h-8 flex items-center justify-center hover:bg-accent relative',
                componentRadius.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <Bell className={sm} />
              {notificationCount > 0 && (
                <span className={cn(
                  'absolute -top-1 -right-1 w-4 h-4',
                  'bg-red-500 text-white text-xs',
                  'flex items-center justify-center',
                  componentRadius.badge.pill
                )}>
                  {notificationCount}
                </span>
              )}
            </button>
            
          </div>
        </div>

        {/* All Navigation Items */}
        <div className={cn(
          'flex flex-col space-y-0 flex-1',
          px2, // 8px horizontal padding
          py2 // 8px vertical padding
        )}>
          {primaryNavigation.map((section) => (
            <React.Fragment key={section.id}>
              {section.label && (
                <div className={cn(
                  'px-2 py-2 mt-4 first:mt-0',
                  typography.body.small,
                  'font-medium uppercase tracking-wider',
                  text.muted
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
                  <div className={cn(px2, py2)}>
                    <button className={cn(
                      'w-full flex items-center',
                      gap1wo,
                      'hover:bg-accent',
                      componentRadius.button.sm,
                      animations.transition.fast,
                      space2,
                      text.muted,
                      typography.body.small
                    )}>
                      <Plus className={sm} />
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
          'pb-4',
          px2 // 8px horizontal padding
        )}>
          <div className={cn(
            'flex items-center justify-start'
          )}>
            <ThemeToggle />
          </div>
        </div>

        {/* Bottom Section: User Account */}
        <div className={cn(
          'mb-2', // 8px bottom margin
          px2 // 8px horizontal padding
        )}>
          {/* User Account Info */}
          <UserMenu>
            <div className={cn(
              "flex items-center cursor-pointer hover:bg-accent w-full",
              'gap-2', // 8px gap
              componentRadius.button.md,
              animations.transition.fast,
              'p-2', // 全方向8px
              'border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
            )}>
              {/* Avatar Icon Only */}
              <div className="flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <Avatar 
                    src={user.user_metadata.avatar_url} 
                    className={cn(
                      lg, 'border',
                      border.universal,
                      componentRadius.media.avatar
                    )}
                  />
                ) : user?.user_metadata?.profile_icon ? (
                  <div className={cn(
                    lg, 'text-sm flex items-center justify-center bg-accent border',
                    border.universal,
                    componentRadius.media.avatar
                  )}>
                    {user.user_metadata.profile_icon}
                  </div>
                ) : (
                  <Avatar 
                    src={undefined}
                    className={cn(
                      lg, 'border',
                      border.universal,
                      componentRadius.media.avatar
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
                  text.primary,
                  typography.body.DEFAULT,
                  'font-medium'
                )}>
                  tomoya
                </div>
                <div className={cn(
                  'truncate',
                  text.muted,
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
          'group-hover:bg-blue-600 dark:group-hover:bg-blue-500'
        )} />
      </div>
    </div>
  )
}