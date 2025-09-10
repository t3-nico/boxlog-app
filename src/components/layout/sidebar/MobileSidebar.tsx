'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { useNavigationStore } from './stores/navigation.store'
import { useNotificationModal } from '@/features/notifications'
import { useAuthContext } from '@/features/auth'
import { primaryNavigation } from '@/config/navigation/config'
import { SidebarItem } from './sidebar-item'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/shadcn-ui/sheet'
import { componentRadius, animations, spacing, icon, typography, appear } from '@/config/theme'
import { background, text, border, ghost } from '@/config/theme/colors'
import { layout } from '@/config/theme/layout'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { Bell, Plus, Search } from 'lucide-react'

const { xs } = layout.heights.header
const { sm, lg } = icon.size
const px2 = 'px-2'
const py2 = 'py-2'

export function MobileSidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useNavigationStore()
  const { open: openNotifications, notificationCount } = useNotificationModal()
  const { user } = useAuthContext()

  // 閉じるボタンを強制的に非表示にするスタイル
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      [data-slot="sheet-content"] [data-slot="sheet-close"] {
        display: none !important;
      }
      [data-slot="sheet-content"] button[class*="Close"] {
        display: none !important;
      }
      [data-slot="sheet-content"] svg[class*="lucide-x"] {
        display: none !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // スワイプジェスチャーのハンドリング
  const handleTouchStart = React.useRef<number | null>(null)
  const handleTouchMove = React.useRef<number | null>(null)

  // キーボードナビゲーション強化
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isSidebarOpen) {
      toggleSidebar()
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    handleTouchMove.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!handleTouchStart.current || !handleTouchMove.current) {
      return
    }

    const distance = handleTouchStart.current - handleTouchMove.current
    const isLeftSwipe = distance > 50

    if (isLeftSwipe && isSidebarOpen) {
      toggleSidebar()
    }

    handleTouchStart.current = null
    handleTouchMove.current = null
  }

  return (
    <Sheet open={isSidebarOpen} onOpenChange={toggleSidebar}>
      {/* Content - Sidebarの内容 */}
      <SheetContent 
        side="left" 
        className={cn(
          'w-4/5 p-0', // 画面の80%幅、パディングなし
          appear.slideLeft, // テーマのslideLeftアニメーション
          background.surface,
          text.primary,
          border.universal,
          '[&_*[class*="sheet-close"]]:!hidden', // 閉じるボタンを完全非表示
          '[&_.lucide-x]:!hidden', // Xアイコンを完全非表示
          '[&_svg[class*="lucide-x"]]:!hidden' // SVG Xアイコンを完全非表示
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={handleKeyDown}
        aria-label="ナビゲーションメニュー"
        aria-modal="true"
        role="dialog"
        style={{
          // 閉じるボタンのスタイルを完全に無効化
          ['--close-button-display' as any]: 'none'
        }}
      >
        <div className="flex-1 flex flex-col h-full">
          {/* Top Section: Account & Actions */}
          <div className={cn(
            'flex items-center justify-end mt-2', // 右側にボタン配置（左側の閉じるボタンなし）
            xs, // 32px height
            px2 // 8px horizontal padding
          )}>
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
          <nav 
            className={cn(
              'flex flex-col space-y-0 flex-1',
              px2, // 8px horizontal padding
              py2 // 8px vertical padding
            )}
            aria-label="メインナビゲーション"
            role="navigation"
          >
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
                      onItemClick={() => toggleSidebar()} // ページクリック時にSidebarを閉じる
                    />
                  ))
                ) : (
                  section.id === 'smart-folders' && (
                    <div className={cn(px2, py2)}>
                      <button className={cn(
                        'w-full flex items-center',
                        'gap-1',
                        'hover:bg-accent',
                        componentRadius.button.sm,
                        animations.transition.fast,
                        'p-2',
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
          </nav>

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
      </SheetContent>
    </Sheet>
  )
}