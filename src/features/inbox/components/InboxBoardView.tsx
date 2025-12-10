'use client'

import { KanbanBoard } from '@/features/board'
import type { PlanStatus } from '@/features/plans/types/plan'

import { useInboxData } from '../hooks/useInboxData'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { InboxBoardToolbar } from './board/InboxBoardToolbar'

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
    status: filters.status[0] as PlanStatus | undefined,
    search: filters.search,
    tags: filters.tags,
    dueDate: filters.dueDate,
  })

  // エラー表示
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-destructive bg-destructive/12 text-destructive rounded-xl border p-4">
          <p className="font-medium">エラーが発生しました</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div id="inbox-view-panel" role="tabpanel" className="flex h-full flex-col">
      {/* ツールバー: 高さ48px固定（8px + 32px + 8px） */}
      <div className="flex h-12 shrink-0 items-center px-4 py-2 md:px-6">
        <InboxBoardToolbar />
      </div>

      {/* Kanbanボード: 残りのスペース */}
      <div className="min-h-0 flex-1 overflow-hidden">
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
