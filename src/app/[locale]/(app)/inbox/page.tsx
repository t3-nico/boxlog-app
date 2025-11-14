'use client'

import { Suspense } from 'react'

import { DisplayModeSwitcher } from '@/features/inbox/components/DisplayModeSwitcher'
import { InboxBoardView } from '@/features/inbox/components/InboxBoardView'
import { InboxSidebar } from '@/features/inbox/components/InboxSidebar'
import { InboxTableView } from '@/features/inbox/components/InboxTableView'
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore'

/**
 * Inboxページ
 *
 * Sidebar + Board/Table切り替え可能なビュー
 */
function InboxContent() {
  const { displayMode } = useInboxViewStore()

  // 表示形式に応じて表示を切り替え
  if (displayMode === 'table') {
    return <InboxTableView />
  }

  return <InboxBoardView />
}

export default function InboxPage() {
  return (
    <div className="flex h-full">
      {/* 左: Sidebar */}
      <div className="border-border w-64 shrink-0 border-r">
        <InboxSidebar activeTicketsCount={0} archivedTicketsCount={0} />
      </div>

      {/* 右: メインコンテンツ */}
      <div className="flex flex-1 flex-col">
        {/* ヘッダー：ビュースイッチャー */}
        <div className="bg-background flex h-12 shrink-0 items-end px-4 pt-2">
          {/* タイトルコンテナ（40px） */}
          <div className="flex h-10 flex-1 items-center gap-1 overflow-hidden">
            <h1 className="truncate text-base font-semibold">Inbox</h1>
          </div>

          {/* アクション: ビュースイッチャー */}
          <div className="flex h-10 items-center gap-2">
            <DisplayModeSwitcher />
          </div>
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
    </div>
  )
}
