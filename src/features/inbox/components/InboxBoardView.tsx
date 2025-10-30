'use client'

import { KanbanBoard } from '@/features/board'
import { KanbanToolbar } from '@/features/board/components/KanbanToolbar'
import { useInboxData, type InboxFilters } from '../hooks/useInboxData'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'

/**
 * Inbox Board View コンポーネント
 *
 * 既存のKanbanBoardをInbox用にラップし、
 * - useInboxData でデータ取得
 * - useInboxBoardFilterStore でフィルタ管理
 *
 * @example
 * ```tsx
 * <InboxBoardView />
 * ```
 */
export function InboxBoardView() {
  const filters = useInboxFilterStore()
  const { items, isLoading, error } = useInboxData({
    status: filters.status[0] as InboxFilters['status'],
    search: filters.search,
  })

  // エラー表示
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4">
          <p className="font-medium">エラーが発生しました</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div id="inbox-view-panel" role="tabpanel" className="flex h-full flex-col">
      {/* ツールバー: フィルター・検索 */}
      <div className="flex shrink-0 px-4 py-4 md:px-6">
        <KanbanToolbar />
      </div>

      {/* Kanbanボード: 残りのスペース */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground text-sm">読み込み中...</p>
            </div>
          </div>
        ) : (
          <KanbanBoard items={items} />
        )}
      </div>
    </div>
  )
}
