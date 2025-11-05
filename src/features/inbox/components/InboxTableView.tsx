'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { Activity, Calendar, CalendarClock, FileText, Hash, Tag } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxKeyboardShortcuts } from '../hooks/useInboxKeyboardShortcuts'
import { useInboxColumnStore } from '../stores/useInboxColumnStore'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxGroupStore } from '../stores/useInboxGroupStore'
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore'
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { useInboxViewStore } from '../stores/useInboxViewStore'
import { groupItems } from '../utils/grouping'
import { BulkActionsToolbar } from './table/BulkActionsToolbar'
import { GroupBySelector } from './table/GroupBySelector'
import { GroupHeader } from './table/GroupHeader'
import { InboxTableEmptyState } from './table/InboxTableEmptyState'
import { InboxTableRow } from './table/InboxTableRow'
import { ResizableTableHead } from './table/ResizableTableHead'
import { SavedViewsSelector } from './table/SavedViewsSelector'
import { TablePagination } from './table/TablePagination'
import { TableToolbar } from './table/TableToolbar'

// 列IDとアイコンのマッピング
const columnIcons = {
  ticket_number: Hash,
  title: FileText,
  status: Activity,
  tags: Tag,
  due_date: CalendarClock,
  created_at: Calendar,
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
  const { selectedIds, toggleAll } = useInboxSelectionStore()
  const { getVisibleColumns } = useInboxColumnStore()
  const { getActiveView } = useInboxViewStore()
  const { groupBy, collapsedGroups } = useInboxGroupStore()
  const { items, isLoading, error } = useInboxData({
    status: filters.status[0] as TicketStatus | undefined,
    search: filters.search,
  })

  // アクティブなビューを取得
  const activeView = getActiveView()

  // 検索フィールドのref（キーボードショートカット用）
  const searchInputRef = useRef<HTMLInputElement>(null)

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
        case 'ticket_number':
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
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
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
  const selectedCount = useMemo(
    () => currentPageIds.filter((id) => selectedIds.has(id)).length,
    [currentPageIds, selectedIds]
  )
  const allSelected = selectedCount === currentPageIds.length && currentPageIds.length > 0
  const someSelected = selectedCount > 0 && selectedCount < currentPageIds.length

  // 全選択ハンドラー
  const handleToggleAll = () => {
    toggleAll(currentPageIds)
  }

  // キーボードショートカットを有効化
  useInboxKeyboardShortcuts({
    itemIds: currentPageIds,
    searchInputRef,
    enabled: !isLoading && !error,
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
      {/* ツールバー: フィルター・検索 */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <SavedViewsSelector
            currentState={{
              filters: {
                status: filters.status,
                search: filters.search,
              },
              sorting: sortField && sortDirection ? { field: sortField, direction: sortDirection } : undefined,
              pageSize,
            }}
          />
          <GroupBySelector />
        </div>
        <TableToolbar searchInputRef={searchInputRef} />
      </div>

      {/* 一括操作ツールバー */}
      <BulkActionsToolbar />

      {/* テーブル */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 md:px-6">
        {/* テーブル部分: 枠で囲む */}
        <div className="border-border flex-1 overflow-hidden rounded-lg border">
          {/* ヘッダー: 固定 */}
          <div className="overflow-x-auto">
            <Table className="min-w-full" style={{ tableLayout: 'fixed' }}>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => {
                    if (column.id === 'selection') {
                      return (
                        <TableHead key={column.id} style={{ width: `${column.width}px` }}>
                          <Checkbox
                            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                            onCheckedChange={handleToggleAll}
                          />
                        </TableHead>
                      )
                    }

                    // アイコンを取得
                    const Icon = columnIcons[column.id as keyof typeof columnIcons]

                    if (column.id === 'tags') {
                      return (
                        <ResizableTableHead key={column.id} columnId={column.id} icon={Icon}>
                          {column.label}
                        </ResizableTableHead>
                      )
                    }

                    // ソート可能な列
                    return (
                      <ResizableTableHead key={column.id} columnId={column.id} sortField={column.id as any} icon={Icon}>
                        {column.label}
                      </ResizableTableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* ボディ: スクロール可能 */}
          <div className="h-full overflow-x-auto overflow-y-auto" style={{ height: 'calc(100% - 41px)' }}>
            <Table className="min-w-full" style={{ tableLayout: 'fixed' }}>
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
                  paginatedItems.map((item) => <InboxTableRow key={item.id} item={item} />)
                )}
              </TableBody>
            </Table>
          </div>
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
