'use client'

import { InboxBoardView } from '@/features/inbox/components/InboxBoardView'
import { InboxTableView } from '@/features/inbox/components/InboxTableView'
import { InboxViewTabs } from '@/features/inbox/components/InboxViewTabs'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

/**
 * Inboxページ
 *
 * URLパラメータ `?view=board|table` でビューを切り替え
 * デフォルト: board
 */
function InboxContent() {
  const searchParams = useSearchParams()
  const view = (searchParams?.get('view') as 'board' | 'table') || 'board'

  return (
    <>
      {/* タブ */}
      <div className="border-border shrink-0 border-b px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inbox</h1>
          <InboxViewTabs />
        </div>
      </div>

      {/* ビューコンテンツ */}
      <div className="flex-1 overflow-hidden">
        {view === 'board' ? <InboxBoardView key="board-view" /> : <InboxTableView key="table-view" />}
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
