'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TicketStatus } from '@/features/plans/types/ticket'
import { Activity, Calendar, CalendarRange, FileText, Hash, Tag } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

import type { InboxItem } from '../hooks/useInboxData'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxColumnStore } from '../stores/useInboxColumnStore'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxGroupStore } from '../stores/useInboxGroupStore'
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore'
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore'
import type { SortField } from '../stores/useInboxSortStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { useInboxViewStore } from '../stores/useInboxViewStore'
import { groupItems } from '../utils/grouping'
import { GroupBySelector } from './table/GroupBySelector'
import { GroupHeader } from './table/GroupHeader'
import { InboxSelectionActions } from './table/InboxSelectionActions'
import { InboxSelectionBar } from './table/InboxSelectionBar'
import { InboxTableEmptyState } from './table/InboxTableEmptyState'
import { InboxTableRow } from './table/InboxTableRow'
import { InboxTableRowCreate, type InboxTableRowCreateHandle } from './table/InboxTableRowCreate'
import { ResizableTableHead } from './table/ResizableTableHead'
import { TablePagination } from './table/TablePagination'
import { TableToolbar } from './table/TableToolbar'

// 列IDとアイコンのマッピング
const columnIcons = {
  id: Hash,
  title: FileText,
  status: Activity,
  tags: Tag,
  duration: CalendarRange,
  created_at: Calendar,
  updated_at: Calendar,
} as const

/**
 * Inbox Table View コンポーネント
 *
 * テーブル形式でチケットを表示
 * - useInboxData でデータ取得
 * - useInboxFilterStore でフィルタ管理
 * - 行クリックで Inspector 表示
 *
 * @example
 * ```tsx
 * <InboxTableView />
 * ```
 */
export function InboxTableView() {
  const filters = useInboxFilterStore()
  const { sortField, sortDirection, setSort } = useInboxSortStore()
  const { currentPage, pageSize, setCurrentPage, setPageSize } = useInboxPaginationStore()
  const { selectedIds, toggleAll, clearSelection } = useInboxSelectionStore()
  const { getVisibleColumns } = useInboxColumnStore()
  const { getActiveView } = useInboxViewStore()
  const { groupBy, collapsedGroups } = useInboxGroupStore()
  const { items, isLoading, error } = useInboxData({
    status: filters.status[0] as TicketStatus | undefined,
    search: filters.search,
    tags: filters.tags,
    dueDate: filters.dueDate,
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

  // 表示する列を取得
  const visibleColumns = getVisibleColumns()

  // アクティブビュー変更時にフィルター・ソート・ページサイズを適用
  useEffect(() => {
    if (!activeView) return

    // フィルター適用
    if (activeView.filters.status) {
      filters.setStatus(activeView.filters.status as TicketStatus[])
    }
    if (activeView.filters.search) {
      filters.setSearch(activeView.filters.search)
    }

    // ソート適用
    if (activeView.sorting) {
      setSort(activeView.sorting.field, activeView.sorting.direction)
    }

    // ページサイズ適用
    if (activeView.pageSize) {
      setPageSize(activeView.pageSize)
    }
  }, [activeView, filters, setSort, setPageSize])

  // フィルター変更時にページ1に戻る
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.status, filters.search, setCurrentPage])

  // ソート適用
  const sortedItems = useMemo(() => {
    if (!sortField || !sortDirection) return items

    return [...items].sort((a, b) => {
      let aValue: string | number | null = null
      let bValue: string | number | null = null

      switch (sortField) {
        case 'id':
          aValue = a.ticket_number || ''
          bValue = b.ticket_number || ''
          break
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'duration':
          aValue = a.start_time ? new Date(a.start_time).getTime() : 0
          bValue = b.start_time ? new Date(b.start_time).getTime() : 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime()
          bValue = new Date(b.updated_at).getTime()
          break
      }

      if (aValue === null || aValue === '') return 1
      if (bValue === null || bValue === '') return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })
  }, [items, sortField, sortDirection])

  // グループ化適用
  const groupedData = useMemo(() => {
    return groupItems(sortedItems, groupBy)
  }, [sortedItems, groupBy])

  // ページネーション適用（グループ化なしの場合のみ）
  const paginatedItems = useMemo(() => {
    if (groupBy) return sortedItems // グループ化時はページネーションなし
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedItems.slice(startIndex, endIndex)
  }, [sortedItems, currentPage, pageSize, groupBy])

  // 全選択状態の計算（フックはreturnの前に必ず配置）
  const currentPageIds = useMemo(() => paginatedItems.map((item) => item.id), [paginatedItems])
  const selectedCountInPage = useMemo(
    () => currentPageIds.filter((id) => selectedIds.has(id)).length,
    [currentPageIds, selectedIds]
  )
  const allSelected = selectedCountInPage === currentPageIds.length && currentPageIds.length > 0
  const someSelected = selectedCountInPage > 0 && selectedCountInPage < currentPageIds.length

  // 全選択ハンドラー
  const handleToggleAll = () => {
    toggleAll(currentPageIds)
  }

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
              items={paginatedItems}
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
        <div className="flex h-12 shrink-0 items-end gap-2 px-4 pt-2 md:px-6">
          <div className="flex h-10 w-full items-center justify-between gap-2">
            <GroupBySelector />
            <TableToolbar onCreateClick={() => createRowRef.current?.startCreate()} />
          </div>
        </div>
      )}

      {/* テーブル */}
      <div
        className="flex flex-1 flex-col overflow-hidden px-4 pt-4 md:px-6"
        onClick={(e) => {
          // テーブルコンテナの直接クリック（空白部分）で選択解除（Tagsテーブルと同様）
          if (e.target === e.currentTarget) {
            useInboxSelectionStore.getState().clearSelection()
          }
        }}
      >
        {/* テーブル部分: 枠で囲む + 横スクロール対応 */}
        <div className="border-border flex flex-1 flex-col overflow-auto rounded-lg border [&::-webkit-scrollbar-corner]:rounded-lg [&::-webkit-scrollbar-track]:rounded-lg">
          <Table className="w-full">
            {/* ヘッダー: 固定 */}
            <TableHeader className="bg-background sticky top-0 z-10">
              <TableRow>
                {visibleColumns.map((column) => {
                  if (column.id === 'selection') {
                    return (
                      <TableHead key={column.id} style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}>
                        <Checkbox
                          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                          onCheckedChange={handleToggleAll}
                        />
                      </TableHead>
                    )
                  }

                  // アイコンを取得
                  const Icon = columnIcons[column.id as keyof typeof columnIcons]

                  // tagsはソート不可
                  if (column.id === 'tags') {
                    return (
                      <ResizableTableHead key={column.id} columnId={column.id} icon={Icon}>
                        {column.label}
                      </ResizableTableHead>
                    )
                  }

                  // ソート可能な列（selection, tags以外）
                  return (
                    <ResizableTableHead
                      key={column.id}
                      columnId={column.id}
                      sortField={column.id as SortField}
                      icon={Icon}
                    >
                      {column.label}
                    </ResizableTableHead>
                  )
                })}
              </TableRow>
            </TableHeader>

            {/* ボディ: スクロール可能 */}
            <TableBody>
              {paginatedItems.length === 0 ? (
                <InboxTableEmptyState columnCount={visibleColumns.length} totalItems={items.length} />
              ) : groupBy ? (
                // グループ化表示
                groupedData.map((group) => [
                  <GroupHeader
                    key={`header-${group.groupKey}`}
                    groupKey={group.groupKey}
                    groupLabel={group.groupLabel}
                    count={group.count}
                    columnCount={visibleColumns.length}
                  />,
                  ...(collapsedGroups.has(group.groupKey)
                    ? []
                    : group.items.map((item) => <InboxTableRow key={item.id} item={item} />)),
                ])
              ) : (
                // 通常表示
                <>
                  {paginatedItems.map((item) => (
                    <InboxTableRow key={item.id} item={item} />
                  ))}
                  {/* Notionスタイル：新規作成行 */}
                  <InboxTableRowCreate ref={createRowRef} />
                  {/* 下部スペーサー：スクロールバーと被らないように4px確保 */}
                  <TableRow className="pointer-events-none h-1" />
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* フッター: テーブルの外側に配置（グループ化なしの場合のみ） */}
        {!groupBy && (
          <div className="shrink-0">
            <TablePagination totalItems={sortedItems.length} />
          </div>
        )}
      </div>
    </div>
  )
}
