'use client'

import { BarChart3, Calendar, Inbox, PanelLeftClose, PanelLeftOpen, Tag } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useTranslations, useLocale } from 'next-intl'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { useGlobalSearch } from '@/features/search'

import { Account } from './Account'
import { Actions } from './Actions'
import { Navigation } from './Navigation'
import type { AppBarNavItem } from './types'

/**
 * コンパクトAppBar（64px幅）
 *
 * 3つのセクションに分離：
 * - アカウント: ユーザーアバター + ドロップダウンメニュー
 * - ナビゲーション: Calendar/Inbox/Stats
 * - アクション: Search/Theme/Notifications/Settings
 *
 * **デザイン仕様**:
 * - 幅: 64px（固定）
 * - 8pxグリッドシステム準拠
 * - セマンティックトークン使用
 *
 * @example
 * ```tsx
 * <AppBar />
 * ```
 */
export function AppBar() {
  const user = useAuthStore((state) => state.user)
  const { open: openGlobalSearch } = useGlobalSearch()
  const { resolvedTheme, setTheme } = useTheme()
  // selector化: 必要な値だけ監視（他の状態変更時の再レンダリングを防止）
  const isOpen = useSidebarStore((state) => state.isOpen)
  const toggle = useSidebarStore((state) => state.toggle)

  const t = useTranslations()
  const locale = useLocale() as 'ja' | 'en'

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'ユーザー',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  }

  // ナビゲーションアイテム
  const navItems: AppBarNavItem[] = useMemo(
    () => [
      {
        id: 'calendar',
        icon: Calendar,
        label: t('sidebar.navigation.calendar'),
        url: `/${locale}/calendar`,
      },
      {
        id: 'inbox',
        icon: Inbox,
        label: t('sidebar.navigation.inbox'),
        url: `/${locale}/inbox`,
      },
      {
        id: 'stats',
        icon: BarChart3,
        label: t('sidebar.navigation.stats'),
        url: `/${locale}/stats`,
      },
      {
        id: 'tags',
        icon: Tag,
        label: t('sidebar.navigation.tags'),
        url: `/${locale}/tags`,
      },
    ],
    [t, locale]
  )

  return (
    <aside
      className="bg-sidebar text-sidebar-foreground flex h-full w-16 flex-col gap-0 py-2"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Toggle */}
      <div className="flex items-center justify-center">
        <Button
          onClick={toggle}
          size="icon"
          variant="ghost"
          aria-label={isOpen ? t('sidebar.closeSidebar') : t('sidebar.openSidebar')}
          className="text-muted-foreground size-10 shrink-0"
        >
          {isOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
        </Button>
      </div>

      <Navigation navItems={navItems} />
      <Actions onSearch={openGlobalSearch} onToggleTheme={setTheme} resolvedTheme={resolvedTheme} t={t} />
      <Account userData={userData} locale={locale} />
    </aside>
  )
}
