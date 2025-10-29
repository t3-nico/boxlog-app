'use client'

import { InboxBoardView } from '@/features/inbox/components/InboxBoardView'
import { InboxTableView } from '@/features/inbox/components/InboxTableView'
import { InboxViewTabs } from '@/features/inbox/components/InboxViewTabs'
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

/**
 * Inboxページ
 *
 * URLパラメータ `?view={viewId}` でビューを切り替え
 * デフォルト: default-board
 */
function InboxContent() {
  const searchParams = useSearchParams()
  const viewId = searchParams?.get('view')
  const { getViewById, activeViewId, setActiveView } = useInboxViewStore()

  // URLパラメータからView IDを取得してアクティブViewを設定
  useEffect(() => {
    if (viewId) {
      const view = getViewById(viewId)
      if (view && activeViewId !== viewId) {
        setActiveView(viewId)
      }
    }
  }, [viewId, getViewById, activeViewId, setActiveView])

  // アクティブなViewを取得
  const activeView = getViewById(activeViewId || 'default-board')
  const viewType = activeView?.type || 'board'

  return (
    <>
      {/* タブヘッダー - Sidebar風アンダーラインデザイン（h-12: 48px = 8px padding-top + 40px tabs） */}
      <div className="border-border h-12 shrink-0 border-b px-4 pt-2 md:px-6">
        <InboxViewTabs />
      </div>

      {/* ビューコンテンツ */}
      <div className="flex-1 overflow-hidden">
        {viewType === 'board' ? <InboxBoardView key={activeViewId} /> : <InboxTableView key={activeViewId} />}
      </div>
    </>
  )
}

export default function InboxPage() {
  return (
    <div className="flex h-full flex-col">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground text-sm">読み込み中...</p>
            </div>
          </div>
        }
      >
        <InboxContent />
      </Suspense>
    </div>
  )
}
