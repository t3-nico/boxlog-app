'use client'

import { BarChart3, Calendar, SquareKanban, Table as TableIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { useTheme } from '@/contexts/theme-context'
import { useAuthContext } from '@/features/auth'
import { useI18n } from '@/features/i18n/lib/hooks'
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
      className="bg-sidebar text-sidebar-foreground flex h-full w-16 flex-col gap-4 py-4"
      role="navigation"
      aria-label="Main navigation"
    >
      <Account userData={userData} locale={locale} />
      <Navigation navItems={navItems} />
      <Actions
        onSearch={openGlobalSearch}
        onToggleTheme={setTheme}
        resolvedTheme={resolvedTheme}
        locale={locale}
        t={t}
      />
    </aside>
  )
}
