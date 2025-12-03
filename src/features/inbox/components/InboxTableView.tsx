'use client'

import { DataTable, type ColumnDef, type GroupedData, type SortState } from '@/components/common/table'
import type { PlanStatus } from '@/features/plans/types/plan'
import { Activity, Calendar, CalendarRange, FileText, Hash, Tag } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { InboxItem } from '../hooks/useInboxData'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxColumnStore } from '../stores/useInboxColumnStore'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxGroupStore } from '../stores/useInboxGroupStore'
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore'
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { useInboxViewStore } from '../stores/useInboxViewStore'
import { groupItems } from '../utils/grouping'
import { GroupBySelector } from './table/GroupBySelector'
import { InboxCellContent } from './table/InboxCellContent'
import { InboxRowWrapper } from './table/InboxRowWrapper'
import { InboxSelectionActions } from './table/InboxSelectionActions'
import { InboxSelectionBar } from './table/InboxSelectionBar'
import { InboxTableEmptyState } from './table/InboxTableEmptyState'
import { InboxTableRowCreate, type InboxTableRowCreateHandle } from './table/InboxTableRowCreate'
import { TableToolbar } from './table/TableToolbar'

/**
 * Inbox Table View コンポーネント
 *
 * DataTableを使用したテーブル形式でプランを表示
 * - グループ化対応
 * - ソート・フィルター・ページネーション
 * - 行クリックで Inspector 表示
 */
export function InboxTableView() {
  const filters = useInboxFilterStore()
  const { sortField, sortDirection, setSort } = useInboxSortStore()
  const { currentPage, pageSize, setCurrentPage, setPageSize } = useInboxPaginationStore()
  const { selectedIds, setSelectedIds, clearSelection } = useInboxSelectionStore()
  const { getVisibleColumns, getColumnWidth, setColumnWidth } = useInboxColumnStore()
  const { getActiveView } = useInboxViewStore()
  const { groupBy, collapsedGroups, toggleGroupCollapse } = useInboxGroupStore()
  const { items, isLoading, error } = useInboxData({
    status: filters.status[0] as PlanStatus | undefined,
    search: filters.search,
    tags: filters.tags,
    dueDate: filters.dueDate,
  })

  // 新規作成行のref
  const createRowRef = useRef<InboxTableRowCreateHandle>(null)

  // 選択数
  const selectedCount = selectedIds.size
  const selectedIdsArray = useMemo(() => Array.from(selectedIds), [selectedIds])

  // アクションハンドラー
  const handleArchive = () => {
    console.log('Archive:', selectedIdsArray)
  }

  const handleDelete = () => {
    console.log('Delete:', selectedIdsArray)
  }

  const handleEdit = (item: InboxItem) => {
    console.log('Edit:', item.id)
  }

  const handleDuplicate = (item: InboxItem) => {
    console.log('Duplicate:', item.id)
  }

  const handleAddTags = () => {
    console.log('Add tags to:', selectedIdsArray)
  }

  const handleChangeDueDate = () => {
    console.log('Change due date for:', selectedIdsArray)
  }

  // アクティブなビューを取得
  const activeView = getActiveView()

  // 表示する列を取得
  const visibleColumns = getVisibleColumns()

  // アクティブビュー変更時にフィルター・ソート・ページサイズを適用
  useEffect(() => {
    if (!activeView) return

    if (activeView.filters.status) {
      filters.setStatus(activeView.filters.status as PlanStatus[])
    }
    if (activeView.filters.search) {
      filters.setSearch(activeView.filters.search)
    }

    if (activeView.sorting) {
      setSort(activeView.sorting.field, activeView.sorting.direction)
    }

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
          aValue = a.plan_number || ''
          bValue = b.plan_number || ''
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
  const groupedData: GroupedData<InboxItem>[] | undefined = useMemo(() => {
    if (!groupBy) return undefined
    return groupItems(sortedItems, groupBy)
  }, [sortedItems, groupBy])

  // DataTable用のソート状態
  const sortState: SortState = useMemo(
    () => ({
      field: sortField,
      direction: sortDirection || 'asc',
    }),
    [sortField, sortDirection]
  )

  // DataTable用のソート変更ハンドラー
  const handleSortChange = useCallback(
    (newSortState: SortState) => {
      if (newSortState.field) {
        setSort(newSortState.field, newSortState.direction)
      }
    },
    [setSort]
  )

  // DataTable用の選択変更ハンドラー
  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedIds(Array.from(newSelectedIds))
    },
    [setSelectedIds]
  )

  // DataTable用のページネーション変更ハンドラー
  const handlePaginationChange = useCallback(
    (state: { currentPage: number; pageSize: number }) => {
      setCurrentPage(state.currentPage)
      setPageSize(state.pageSize)
    },
    [setCurrentPage, setPageSize]
  )

  // DataTable用の列定義
  const columns: ColumnDef<InboxItem>[] = useMemo(() => {
    const columnIcons: Record<string, typeof Hash> = {
      id: Hash,
      title: FileText,
      status: Activity,
      tags: Tag,
      duration: CalendarRange,
      created_at: Calendar,
      updated_at: Calendar,
    }

    return visibleColumns
      .filter((col) => col.id !== 'selection')
      .map((col) => ({
        id: col.id,
        label: col.label,
        width: col.width,
        resizable: col.resizable,
        sortKey: col.id !== 'tags' ? col.id : undefined,
        icon: columnIcons[col.id],
        render: (item: InboxItem) => (
          <InboxCellContent item={item} columnId={col.id} width={getColumnWidth(col.id)} />
        ),
      }))
  }, [visibleColumns, getColumnWidth])

  // DataTable用の列幅マップ
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {}
    visibleColumns.forEach((col) => {
      widths[col.id] = col.width
    })
    return widths
  }, [visibleColumns])

  // 行ラッパー
  const rowWrapper = useCallback(
    ({ item, children, isSelected }: { item: InboxItem; children: ReactNode; isSelected: boolean }) => (
      <InboxRowWrapper key={item.id} item={item} isSelected={isSelected}>
        {children}
      </InboxRowWrapper>
    ),
    []
  )

  // エラー表示
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-destructive bg-destructive/10 text-destructive rounded-xl border p-4">
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
      {/* ツールバー または 選択バー */}
      {selectedCount > 0 ? (
        <InboxSelectionBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          actions={
            <InboxSelectionActions
              selectedCount={selectedCount}
              selectedIds={selectedIdsArray}
              items={sortedItems}
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
      <div className="flex flex-1 flex-col overflow-hidden px-4 pt-4 md:px-6">
        <DataTable
          data={sortedItems}
          columns={columns}
          getRowKey={(item) => item.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          sortState={sortState}
          onSortChange={handleSortChange}
          showPagination={!groupBy}
          paginationState={{ currentPage, pageSize }}
          onPaginationChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50, 100]}
          columnWidths={columnWidths}
          onColumnWidthChange={setColumnWidth}
          groupedData={groupedData}
          collapsedGroups={collapsedGroups}
          onToggleGroupCollapse={toggleGroupCollapse}
          rowWrapper={rowWrapper}
          onOutsideClick={clearSelection}
          selectAllLabel="全て選択"
          getSelectLabel={(item) => `${item.title}を選択`}
          extraRows={!groupBy ? <InboxTableRowCreate ref={createRowRef} /> : undefined}
          emptyState={<InboxTableEmptyState columnCount={visibleColumns.length} totalItems={items.length} />}
          stickyHeader
        />
      </div>
    </div>
  )
}
