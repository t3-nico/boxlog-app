'use client'

import { BarChart3, Calendar, PanelLeftClose, PanelLeftOpen, SquareKanban, Table as TableIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { useAuthContext } from '@/features/auth'
import { useI18n } from '@/features/i18n/lib/hooks'
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
 * - ナビゲーション: Calendar/Board/Table/Stats
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
  const pathname = usePathname()
  const { user } = useAuthContext()
  const { open: openGlobalSearch } = useGlobalSearch()
  const { resolvedTheme, setTheme } = useTheme()
  const { isOpen, toggle } = useSidebarStore()

  // URLから locale を抽出 (例: /ja/calendar -> ja)
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t, locale } = useI18n(localeFromPath)

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
        id: 'board',
        icon: SquareKanban,
        label: t('sidebar.navigation.board'),
        url: `/${locale}/board`,
      },
      {
        id: 'table',
        icon: TableIcon,
        label: t('sidebar.navigation.table'),
        url: `/${locale}/table`,
      },
      {
        id: 'stats',
        icon: BarChart3,
        label: t('sidebar.navigation.stats'),
        url: `/${locale}/stats`,
      },
    ],
    [t, locale]
  )

  return (
    <aside
      className="bg-sidebar text-sidebar-foreground flex h-full w-16 flex-col gap-4 py-2"
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
          className="text-muted-foreground hover:text-foreground size-8 shrink-0"
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
