'use client'

import type { PlanStatus } from '@/features/plans/types/plan'
import { useEffect, useRef } from 'react'

import { TablePagination } from '@/features/table'
import type { InboxItem } from '../hooks/useInboxData'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxGroupStore } from '../stores/useInboxGroupStore'
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore'
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { useInboxViewStore } from '../stores/useInboxViewStore'
import { GroupBySelector } from './table/GroupBySelector'
import { InboxSelectionActions } from './table/InboxSelectionActions'
import { InboxSelectionBar } from './table/InboxSelectionBar'
import { InboxTableContent } from './table/InboxTableContent'
import { type InboxTableRowCreateHandle } from './table/InboxTableRowCreate'
import { TableToolbar } from './table/TableToolbar'

/**
 * Inbox Table View コンポーネント
 *
 * テーブル形式でプランを表示
 * - useInboxData でデータ取得
 * - useInboxFilterStore でフィルタ管理
 * - 行クリックで Inspector 表示
 *
 * パフォーマンス最適化:
 * - Store監視をselectorで必要な値のみに限定
 * - テーブル本体はInboxTableContentに委譲（担当制）
 * - 各子コンポーネントはmemo化済み
 *
 * @example
 * ```tsx
 * <InboxTableView />
 * ```
 */
export function InboxTableView() {
  // フィルター関連：必要な値のみselectorで取得
  const filterStatus = useInboxFilterStore((state) => state.status)
  const filterSearch = useInboxFilterStore((state) => state.search)
  const filterTags = useInboxFilterStore((state) => state.tags)
  const filterDueDate = useInboxFilterStore((state) => state.dueDate)
  const setStatus = useInboxFilterStore((state) => state.setStatus)
  const setSearch = useInboxFilterStore((state) => state.setSearch)

  // ソート関連
  const setSort = useInboxSortStore((state) => state.setSort)

  // ページネーション関連
  const currentPage = useInboxPaginationStore((state) => state.currentPage)
  const pageSize = useInboxPaginationStore((state) => state.pageSize)
  const setCurrentPage = useInboxPaginationStore((state) => state.setCurrentPage)
  const setPageSize = useInboxPaginationStore((state) => state.setPageSize)

  // 選択関連
  const selectedIds = useInboxSelectionStore((state) => state.selectedIds)
  const clearSelection = useInboxSelectionStore((state) => state.clearSelection)

  // ビュー関連
  const getActiveView = useInboxViewStore((state) => state.getActiveView)

  // グループ化関連（ページネーション表示判定用）
  const groupBy = useInboxGroupStore((state) => state.groupBy)

  // データ取得
  const { items, isLoading, error } = useInboxData({
    status: filterStatus[0] as PlanStatus | undefined,
    search: filterSearch,
    tags: filterTags,
    dueDate: filterDueDate,
  })

  // 新規作成行のref
  const createRowRef = useRef<InboxTableRowCreateHandle>(null)

  // 選択数
  const selectedCount = selectedIds.size

  // アクションハンドラー
  const handleArchive = () => {
    // TODO: アーカイブ機能実装
    console.log('Archive:', Array.from(selectedIds))
  }

  const handleDelete = () => {
    // TODO: 削除機能実装
    console.log('Delete:', Array.from(selectedIds))
  }

  const handleEdit = (item: InboxItem) => {
    // TODO: 編集機能実装（Inspectorを開く）
    console.log('Edit:', item.id)
  }

  const handleDuplicate = (item: InboxItem) => {
    // TODO: 複製機能実装
    console.log('Duplicate:', item.id)
  }

  const handleAddTags = () => {
    // TODO: タグ一括追加機能実装
    console.log('Add tags to:', Array.from(selectedIds))
  }

  const handleChangeDueDate = () => {
    // TODO: 期限一括変更機能実装
    console.log('Change due date for:', Array.from(selectedIds))
  }

  // アクティブなビューを取得
  const activeView = getActiveView()

  // アクティブビュー変更時にフィルター・ソート・ページサイズを適用
  useEffect(() => {
    if (!activeView) return

    // フィルター適用
    if (activeView.filters.status) {
      setStatus(activeView.filters.status as PlanStatus[])
    }
    if (activeView.filters.search) {
      setSearch(activeView.filters.search)
    }

    // ソート適用
    if (activeView.sorting) {
      setSort(activeView.sorting.field, activeView.sorting.direction)
    }

    // ページサイズ適用
    if (activeView.pageSize) {
      setPageSize(activeView.pageSize)
    }
  }, [activeView, setStatus, setSearch, setSort, setPageSize])

  // フィルター変更時にページ1に戻る
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, filterSearch, setCurrentPage])

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

  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div id="inbox-table-view-panel" role="tabpanel" className="flex h-full flex-col">
      {/* ツールバー または 選択バー（Googleドライブ風） */}
      {selectedCount > 0 ? (
        <InboxSelectionBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          actions={
            <InboxSelectionActions
              selectedCount={selectedCount}
              selectedIds={Array.from(selectedIds)}
              items={items}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onAddTags={handleAddTags}
              onChangeDueDate={handleChangeDueDate}
              onClearSelection={clearSelection}
            />
          }
        />
      ) : (
        <div className="flex h-12 shrink-0 items-center gap-2 px-4 py-2 md:px-6">
          <div className="flex h-8 w-full items-center justify-between gap-2">
            <GroupBySelector />
            <TableToolbar onCreateClick={() => createRowRef.current?.startCreate()} />
          </div>
        </div>
      )}

      {/* テーブル - InboxTableContentに委譲（担当制） */}
      <div
        className="flex flex-1 flex-col overflow-hidden px-4 pt-4 md:px-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            useInboxSelectionStore.getState().clearSelection()
          }
        }}
      >
        <div className="border-border flex flex-1 flex-col overflow-auto rounded-xl border [&::-webkit-scrollbar-corner]:rounded-xl [&::-webkit-scrollbar-track]:rounded-xl">
          <InboxTableContent items={items} createRowRef={createRowRef} />
        </div>

        {/* フッター: グループ化なしの場合のみ */}
        {!groupBy && (
          <div className="shrink-0">
            <TablePagination
              totalItems={items.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>
    </div>
  )
}
