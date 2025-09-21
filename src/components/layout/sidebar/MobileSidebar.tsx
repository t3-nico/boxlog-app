'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { Bell, Plus, Search } from 'lucide-react'

import { Avatar } from '@/components/shadcn-ui/avatar'
import { Sheet, SheetContent } from '@/components/shadcn-ui/sheet'
import { primaryNavigation } from '@/config/navigation/config'
import { animations, colors, icons, layout, rounded, spacing, typography } from '@/config/theme'
import { useAuthContext } from '@/features/auth'
import { useNotificationModal } from '@/features/notifications'
import { cn } from '@/lib/utils'

import { SidebarItem } from './sidebar-item'
import { useNavigationStore } from './stores/navigation.store'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

const { xs } = layout.heights.header
const { sm, lg } = icons.size

export const MobileSidebar = () => {
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
          animations.appear.slideLeft, // テーマのslideLeftアニメーション
          colors.background.surface,
          colors.text.primary,
          colors.border.default,
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
          '--close-button-display': 'none',
        } as React.CSSProperties}
      >
        <div className="flex h-full flex-1 flex-col">
          {/* Top Section: Account & Actions */}
          <div
            className={cn(
              'flex items-center justify-end', // 右側にボタン配置（左側の閉じるボタンなし）
              spacing.margin.top.sm,
              xs, // 32px height
              spacing.padding.horizontal.sm // 8px horizontal padding
            )}
          >
            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Search Button */}
              <button
                type="button"
                className={cn(
                  'hover:bg-accent flex h-8 w-8 items-center justify-center',
                  rounded.component.button.sm,
                  animations.transition.fast,
                  'flex-shrink-0'
                )}
              >
                <Search className={sm} />
              </button>

              {/* Notification Button */}
              <button
                type="button"
                onClick={openNotifications}
                className={cn(
                  'hover:bg-accent relative flex h-8 w-8 items-center justify-center',
                  rounded.component.button.sm,
                  animations.transition.fast,
                  'flex-shrink-0'
                )}
              >
                <Bell className={sm} />
                {notificationCount > 0 && (
                  <span
                    className={cn(
                      'absolute -right-1 -top-1 h-4 w-4',
                      'bg-red-500 text-xs text-white',
                      'flex items-center justify-center',
                      rounded.component.badge.pill
                    )}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* All Navigation Items */}
          <nav
            className={cn(
              'flex flex-1 flex-col space-y-0',
              spacing.padding.horizontal.xs, // 8px horizontal padding
              spacing.padding.vertical.xs // 8px vertical padding
            )}
            aria-label="メインナビゲーション"
            role="navigation"
          >
            {primaryNavigation.map((section) => (
              <React.Fragment key={section.id}>
                {section.label != null && (
                  <div
                    className={cn(
                      'mt-4 px-2 py-2 first:mt-0',
                      typography.body.small,
                      'font-medium uppercase tracking-wider',
                      colors.text.muted
                    )}
                  >
                    {section.label}
                  </div>
                )}
                {section.items.length > 0
                  ? section.items.map((item) => (
                      <SidebarItem
                        key={item.id}
                        item={item}
                        pathname={pathname}
                        onItemClick={() => toggleSidebar()} // ページクリック時にSidebarを閉じる
                      />
                    ))
                  : section.id === 'smart-folders' && (
                      <div className={cn(spacing.padding.horizontal.xs, spacing.padding.vertical.xs)}>
                        <button
                          type="button"
                          className={cn(
                            'flex w-full items-center',
                            'gap-1',
                            'hover:bg-accent',
                            rounded.component.button.sm,
                            animations.transition.fast,
                            'p-2',
                            colors.text.muted,
                            typography.body.small
                          )}
                        >
                          <Plus className={sm} />
                          <span>Add smart folder</span>
                        </button>
                      </div>
                    )}
              </React.Fragment>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div
            className={cn(
              'pb-4',
              spacing.padding.horizontal.xs // 8px horizontal padding
            )}
          >
            <div className={cn('flex items-center justify-start')}>
              <ThemeToggle />
            </div>
          </div>

          {/* Bottom Section: User Account */}
          <div
            className={cn(
              'mb-2', // 8px bottom margin
              spacing.padding.horizontal.xs // 8px horizontal padding
            )}
          >
            {/* User Account Info */}
            <UserMenu>
              <div
                className={cn(
                  'hover:bg-accent flex w-full cursor-pointer items-center',
                  'gap-2', // 8px gap
                  rounded.component.button.md,
                  animations.transition.fast,
                  'p-2', // 全方向8px
                  'border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                {/* Avatar Icon Only */}
                <div className="flex-shrink-0">
                  {user?.user_metadata?.avatar_url ? (
                    <Avatar
                      src={user.user_metadata.avatar_url}
                      className={cn(lg, 'border', colors.border.default, rounded.component.avatar.md)}
                    />
                  ) : user?.user_metadata?.profile_icon ? (
                    <div
                      className={cn(
                        lg,
                        'bg-accent flex items-center justify-center border text-sm',
                        colors.border.default,
                        rounded.component.avatar.md
                      )}
                    >
                      {user.user_metadata.profile_icon}
                    </div>
                  ) : (
                    <Avatar
                      src={undefined}
                      className={cn(lg, 'border', colors.border.default, rounded.component.avatar.md)}
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
      </SheetContent>
    </Sheet>
  )
}
