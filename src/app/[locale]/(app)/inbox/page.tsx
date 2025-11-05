'use client'

import { InboxBoardView } from '@/features/inbox/components/InboxBoardView'
import { InboxTableView } from '@/features/inbox/components/InboxTableView'
import { InboxViewTabs } from '@/features/inbox/components/InboxViewTabs'
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore'
import { Suspense } from 'react'

/**
 * Inboxページ
 *
 * Board/Table切り替え可能なビュー
 */
function InboxContent() {
  const { getActiveView } = useInboxViewStore()
  const activeView = getActiveView()

  // アクティブなViewのタイプに応じて表示を切り替え
  if (activeView?.type === 'table') {
    return <InboxTableView />
  }

  return <InboxBoardView />
}

export default function InboxPage() {
  return (
    <div className="flex h-full flex-col">
      {/* View切り替えタブ */}
      <div className="border-border shrink-0 border-b px-4 md:px-6">
        <InboxViewTabs />
      </div>

      {/* コンテンツエリア */}
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
