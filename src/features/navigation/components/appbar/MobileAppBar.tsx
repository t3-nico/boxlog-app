'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { Bell, Plus, Search } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAuthContext } from '@/features/auth'
import { useNotificationModal } from '@/features/notifications'
import { cn } from '@/lib/utils'

import { AppBarItem } from './appbar-item'
import { allNavigationSections } from './navigation-items'
import { useNavigationStore } from '@/features/navigation/stores/navigation.store'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { UserMenu } from './user-menu'

export const MobileAppBar = () => {
  const pathname = usePathname() || '/'
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
          'animate-slide-in-from-left', // テーマのslideLeftアニメーション
          'bg-white dark:bg-neutral-800',
          'text-neutral-900 dark:text-neutral-100',
          'border-neutral-200 dark:border-neutral-700',
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
              'mt-2',
              'h-8', // 32px height
              'px-2' // 8px horizontal padding
            )}
          >
            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Search Button */}
              <button
                type="button"
                className={cn(
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700 flex h-8 w-8 items-center justify-center',
                  'rounded-md',
                  'transition-colors duration-150',
                  'flex-shrink-0'
                )}
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Notification Button */}
              <button
                type="button"
                onClick={openNotifications}
                className={cn(
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700 relative flex h-8 w-8 items-center justify-center',
                  'rounded-md',
                  'transition-colors duration-150',
                  'flex-shrink-0'
                )}
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span
                    className={cn(
                      'absolute -right-1 -top-1 h-4 w-4',
                      'bg-red-500 text-xs text-white',
                      'flex items-center justify-center',
                      'rounded-full'
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
              'px-2', // 8px horizontal padding
              'py-2' // 8px vertical padding
            )}
            aria-label="メインナビゲーション"
            role="navigation"
          >
            {allNavigationSections.map((section) => (
              <React.Fragment key={section.id}>
                {section.label != null && (
                  <div
                    className={cn(
                      'mt-4 px-2 py-2 first:mt-0',
                      'text-sm',
                      'font-medium uppercase tracking-wider',
                      'text-neutral-600 dark:text-neutral-400'
                    )}
                  >
                    {section.label}
                  </div>
                )}
                {section.items.length > 0
                  ? section.items.map((item) => (
                      <AppBarItem
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        icon={item.icon}
                        href={item.href}
                        isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        onItemClick={() => toggleSidebar()} // ページクリック時にAppBarを閉じる
                      />
                    ))
                  : section.id === 'smart-folders' && (
                      <div className={cn('px-2', 'py-2')}>
                        <button
                          type="button"
                          className={cn(
                            'flex w-full items-center',
                            'gap-1',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                            'rounded-md',
                            'transition-colors duration-150',
                            'p-2',
                            'text-neutral-600 dark:text-neutral-400',
                            'text-sm'
                          )}
                        >
                          <Plus className="h-4 w-4" />
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
              'px-2' // 8px horizontal padding
            )}
          >
            <div className={cn('flex items-center justify-start')}>
              <SimpleThemeToggle />
            </div>
          </div>

          {/* Bottom Section: User Account */}
          <div
            className={cn(
              'mb-2', // 8px bottom margin
              'px-2' // 8px horizontal padding
            )}
          >
            {/* User Account Info */}
            <UserMenu>
              <div
                className={cn(
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700 flex w-full cursor-pointer items-center',
                  'gap-2', // 8px gap
                  'rounded-lg',
                  'transition-colors duration-150',
                  'p-2', // 全方向8px
                  'border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                {/* Avatar Icon Only */}
                <div className="flex-shrink-0">
                  {user?.user_metadata?.profile_icon ? (
                    <div
                      className={cn(
                        'h-8 w-8',
                        'bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center border text-sm',
                        'border-neutral-200 dark:border-neutral-700',
                        'rounded-lg'
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
                      className={cn('h-8 w-8', 'border border-neutral-200 dark:border-neutral-700', 'rounded-lg')}
                    />
                  )}
                </div>

                <div className={cn('flex min-w-0 flex-1 flex-col justify-center')}>
                  <div className={cn('truncate text-neutral-900 dark:text-neutral-100', 'text-base', 'font-medium')}>
                    tomoya
                  </div>
                  <div className={cn('truncate text-neutral-600 dark:text-neutral-400', 'text-sm')}>Free Plan</div>
                </div>
              </div>
            </UserMenu>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
