'use client'

import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

import { InboxSidebar } from '@/features/inbox/components/InboxSidebar'
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore'

interface InboxLayoutProps {
  children: ReactNode
}

/**
 * Inbox共通レイアウト
 *
 * Sidebar + メインコンテンツの2カラムレイアウト
 * URLパスからactiveViewIdを同期
 */
export default function InboxLayout({ children }: InboxLayoutProps) {
  const pathname = usePathname()
  const { setActiveView } = useInboxViewStore()

  // URLパスからviewIdへのマッピング
  useEffect(() => {
    if (!pathname) return

    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]

    // パスからviewId決定
    let viewId: string
    if (lastSegment === 'all') {
      viewId = 'default-all'
    } else if (lastSegment === 'archive') {
      viewId = 'default-archive'
    } else if (segments[segments.length - 2] === 'view') {
      viewId = lastSegment // カスタムビューID
    } else {
      viewId = 'default-all' // デフォルト
    }

    setActiveView(viewId)
  }, [pathname, setActiveView])

  return (
    <div className="flex h-full">
      {/* 左: Sidebar */}
      <div className="border-border w-64 shrink-0 border-r">
        <InboxSidebar activeTicketsCount={0} archivedTicketsCount={0} />
      </div>

      {/* 右: メインコンテンツ */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
