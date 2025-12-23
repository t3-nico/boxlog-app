'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useTranslations } from 'next-intl'

import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'
import { SidebarHeader } from './SidebarHeader'

/**
 * アプリケーション共通Sidebar
 *
 * - ページタイトル表示（SidebarHeader）
 * - ユーザーメニュー（NavUser）
 * - セカンダリナビゲーション（NavSecondary）
 *
 * **デザイン仕様**:
 * - 幅: 240px（ResizablePanel制御）
 * - 8pxグリッドシステム準拠
 * - セマンティックトークン使用
 */
export function AppSidebar() {
  const user = useAuthStore((state) => state.user)
  const pathname = usePathname()
  const t = useTranslations()

  // 現在のページに応じたタイトルを取得
  const pageTitle = useMemo(() => {
    if (!pathname) return ''

    const pathSegments = pathname.split('/')
    const page = pathSegments[2] // /[locale]/[page]

    switch (page) {
      case 'calendar':
        return t('sidebar.navigation.calendar')
      case 'inbox':
        return t('sidebar.navigation.inbox')
      case 'stats':
        return t('sidebar.navigation.stats')
      case 'tags':
        return t('sidebar.navigation.tags')
      default:
        return ''
    }
  }, [pathname, t])

  const data = useMemo(
    () => ({
      navSecondary: [],
    }),
    []
  )

  const userData = {
    name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'ユーザー',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || null,
  }

  return (
    <aside className="bg-surface-container text-foreground flex h-full w-full flex-col">
      {/* Header - ページタイトル */}
      <SidebarHeader title={pageTitle} />

      {/* User Menu */}
      <div className="px-2 py-2">
        <NavUser user={userData} />
      </div>

      {/* Content - スクロールコンテナはパディングなし、内部要素で管理 */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto bg-transparent px-2">
        <NavSecondary items={data.navSecondary} className="mt-auto py-2" />
      </div>
    </aside>
  )
}
