'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { SettingsNavigation } from '@/features/settings/components/settings-navigation'

import { SidebarHeader } from './SidebarHeader'

/**
 * CommonSidebar - 全ページ共通のサイドバー
 * パスに応じて適切なナビゲーションを表示
 *
 * セマンティックトークン:
 * - text-muted-foreground: プレースホルダーテキスト
 */
export const CommonSidebar = () => {
  const pathname = usePathname() || '/'

  // パスからページ名を取得（ロケールを除外）
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/')

  const getPageTitle = () => {
    if (pathWithoutLocale.startsWith('/calendar')) return 'Calendar'
    if (pathWithoutLocale.startsWith('/board')) return 'Board'
    if (pathWithoutLocale.startsWith('/table')) return 'Table'
    if (pathWithoutLocale.startsWith('/stats')) return 'Stats'
    if (pathWithoutLocale.startsWith('/settings')) return 'Settings'
    return 'Home'
  }

  const pageTitle = getPageTitle()

  // Settings専用ナビゲーション
  if (pathWithoutLocale.startsWith('/settings')) {
    return (
      <div className="flex h-full flex-col">
        <SidebarHeader title="Settings" />
        <div className="flex-1 overflow-y-auto px-2">
          <SettingsNavigation />
        </div>
      </div>
    )
  }

  // 他のページはプレースホルダー
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <SidebarHeader title={pageTitle} />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            {pageTitle} content will be added here
          </p>
        </div>
      </div>
    </div>
  )
}
