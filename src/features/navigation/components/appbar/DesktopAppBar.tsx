'use client'

import React, { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { Calendar, SquareKanban, Table, BarChart3, Settings, PanelLeftClose, PanelLeft, LucideIcon } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
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
  previewKey?: string
}

const appBarItems: AppBarItemData[] = [
  { id: 'calendar', labelKey: 'appbar.navigation.calendar', icon: Calendar, href: '/ja/calendar', previewKey: 'appbar.preview.calendar' },
  { id: 'board', labelKey: 'appbar.navigation.board', icon: SquareKanban, href: '/ja/board', previewKey: 'appbar.preview.board' },
  { id: 'table', labelKey: 'appbar.navigation.table', icon: Table, href: '/ja/table', previewKey: 'appbar.preview.table' },
  { id: 'stats', labelKey: 'appbar.navigation.stats', icon: BarChart3, href: '/ja/stats', previewKey: 'appbar.preview.stats' },
  { id: 'settings', labelKey: 'appbar.navigation.settings', icon: Settings, href: '/ja/settings', previewKey: 'appbar.preview.settings' },
]

// プレビューコンテンツの生成 - 実際のサイドバーを模倣
const getPreviewContent = (itemId: string, t: (key: string) => string) => {
  switch (itemId) {
    case 'calendar':
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">表示切替</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• 週表示</p>
              <p className="text-xs text-muted-foreground">• 月表示</p>
              <p className="text-xs text-muted-foreground">• 日表示</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">カレンダー設定</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• 週の開始日</p>
              <p className="text-xs text-muted-foreground">• タイムゾーン</p>
            </div>
          </div>
        </div>
      )
    case 'board':
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">ボード設定</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• レイアウト</p>
              <p className="text-xs text-muted-foreground">• カラム設定</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">タグフィルター</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• 仕事</p>
              <p className="text-xs text-muted-foreground">• 個人</p>
              <p className="text-xs text-muted-foreground">• 重要</p>
            </div>
          </div>
        </div>
      )
    case 'table':
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">表示設定</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• カラム表示</p>
              <p className="text-xs text-muted-foreground">• 行の高さ</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">フィルター</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• ステータス</p>
              <p className="text-xs text-muted-foreground">• 期間</p>
              <p className="text-xs text-muted-foreground">• タグ</p>
            </div>
          </div>
        </div>
      )
    case 'stats':
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">期間設定</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• 今週</p>
              <p className="text-xs text-muted-foreground">• 今月</p>
              <p className="text-xs text-muted-foreground">• カスタム</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">グラフ種類</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• 棒グラフ</p>
              <p className="text-xs text-muted-foreground">• 円グラフ</p>
              <p className="text-xs text-muted-foreground">• 折れ線グラフ</p>
            </div>
          </div>
        </div>
      )
    case 'settings':
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">アカウント</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• プロフィール</p>
              <p className="text-xs text-muted-foreground">• セキュリティ</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">外観</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• テーマ</p>
              <p className="text-xs text-muted-foreground">• 言語</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">通知</p>
            <div className="space-y-1 pl-2">
              <p className="text-xs text-muted-foreground">• メール通知</p>
              <p className="text-xs text-muted-foreground">• プッシュ通知</p>
            </div>
          </div>
        </div>
      )
    default:
      return null
  }
}

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
              previewContent={getPreviewContent(item.id, t)}
            />
          )
        })}
      </nav>

      {/* Bottom: User Avatar */}
      <div className="flex items-center justify-center pb-4">
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
      </div>
    </div>
  )
}
