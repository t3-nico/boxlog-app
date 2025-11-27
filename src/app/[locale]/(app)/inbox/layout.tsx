'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, type ReactNode } from 'react'

import { InboxSidebar } from '@/features/inbox/components/InboxSidebar'
import { useInboxData } from '@/features/inbox/hooks/useInboxData'
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore'

interface InboxLayoutProps {
  children: ReactNode
}

/**
 * Inbox共通レイアウト
 *
 * Sidebar + メインコンテンツの2カラムレイアウト
 * URLパスからactiveViewIdを同期
 *
 * モバイルではSidebarはMobileLayoutのSheetで表示されるため、
 * ここではデスクトップのみ表示
 */
export default function InboxLayout({ children }: InboxLayoutProps) {
  const pathname = usePathname()
  const { setActiveView } = useInboxViewStore()

  // 全Planデータを取得
  const { items } = useInboxData()

  // アクティブなPlan数とアーカイブ数を計算
  const { activePlansCount, archivedPlansCount } = useMemo(() => {
    // TODO: アーカイブフラグがある場合はそれで判定
    // 現状はアーカイブ機能がないため、全てアクティブとして扱う
    const active = items.length
    const archived = 0

    return {
      activePlansCount: active,
      archivedPlansCount: archived,
    }
  }, [items])

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
      {/* 左: Sidebar（デスクトップのみ表示） */}
      <div className="border-border hidden w-64 shrink-0 border-r md:block">
        <InboxSidebar activeplansCount={activePlansCount} archivedplansCount={archivedPlansCount} />
      </div>

      {/* 右: メインコンテンツ */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
