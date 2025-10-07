'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { SidebarHeader } from './SidebarHeader'
import { SidebarSection } from './SidebarSection'

/**
 * CommonSidebar - 全ページ共通のサイドバー
 * ページタイトルのみ表示するシンプルな構成
 */
export const CommonSidebar = () => {
  const pathname = usePathname() || '/'

  // パスからページ名を取得（ロケールを除外）
  const getPageTitle = () => {
    // /ja/calendar のようなパスから /calendar 部分を取得
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/')

    if (pathWithoutLocale.startsWith('/calendar')) return 'Calendar'
    if (pathWithoutLocale.startsWith('/board')) return 'Board'
    if (pathWithoutLocale.startsWith('/table')) return 'Table'
    if (pathWithoutLocale.startsWith('/stats')) return 'Stats'
    if (pathWithoutLocale.startsWith('/settings')) return 'Settings'
    return 'Home'
  }

  const pageTitle = getPageTitle()

  // デバッグ用
  console.log('Current pathname:', pathname, 'Title:', pageTitle)

  return (
    <>
      {/* Header */}
      <SidebarHeader title={pageTitle} />

      {/* 将来的にページ固有のコンテンツを追加 */}
      <div className="flex-1 p-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {pageTitle} content will be added here
        </p>
      </div>
    </>
  )
}
