'use client'

import { memo, useMemo } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Activity, Calendar, CalendarRange, FileText, Hash, Tag } from 'lucide-react'

import type { InboxItem } from '../../hooks/useInboxData'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'
import { useInboxGroupStore } from '../../stores/useInboxGroupStore'
import { useInboxPaginationStore } from '../../stores/useInboxPaginationStore'
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore'
import type { SortField } from '../../stores/useInboxSortStore'
import { useInboxSortStore } from '../../stores/useInboxSortStore'
import { groupItems } from '../../utils/grouping'
import { GroupHeader } from './GroupHeader'
import { InboxTableEmptyState } from './InboxTableEmptyState'
import { InboxTableRow } from './InboxTableRow'
import { InboxTableRowCreate, type InboxTableRowCreateHandle } from './InboxTableRowCreate'
import { ResizableTableHead } from './ResizableTableHead'

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

interface InboxTableContentProps {
  items: InboxItem[]
  createRowRef: React.RefObject<InboxTableRowCreateHandle | null>
}

/**
 * テーブルヘッダー（担当：列表示・ソート・選択）
 * 必要なStoreだけを監視
 */
const TableHeaderSection = memo(function TableHeaderSection({
  allSelected,
  someSelected,
  onToggleAll,
}: {
  allSelected: boolean
  someSelected: boolean
  onToggleAll: () => void
}) {
  // 列表示のみ監視（columnsを取得してuseMemoでフィルタリング）
  const columns = useInboxColumnStore((state) => state.columns)
  const visibleColumns = useMemo(() => columns.filter((col) => col.visible), [columns])

  return (
    <TableHeader className="bg-background sticky top-0 z-10">
      <TableRow>
        {visibleColumns.map((column) => {
          if (column.id === 'selection') {
            return (
              <TableHead key={column.id} style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}>
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
            )
          }

          const Icon = columnIcons[column.id as keyof typeof columnIcons]

          if (column.id === 'tags') {
            return (
              <ResizableTableHead key={column.id} columnId={column.id} icon={Icon}>
                {column.label}
              </ResizableTableHead>
            )
          }

          return (
            <ResizableTableHead key={column.id} columnId={column.id} sortField={column.id as SortField} icon={Icon}>
              {column.label}
            </ResizableTableHead>
          )
        })}
      </TableRow>
    </TableHeader>
  )
})

/**
 * テーブルボディ（担当：データ表示・グループ化）
 * ソート・ページネーション・グループ化のStoreを監視
 */
const TableBodySection = memo(function TableBodySection({
  items,
  createRowRef,
}: {
  items: InboxItem[]
  createRowRef: React.RefObject<InboxTableRowCreateHandle | null>
}) {
  // 必要な値だけをselectorで取得
  const sortField = useInboxSortStore((state) => state.sortField)
  const sortDirection = useInboxSortStore((state) => state.sortDirection)
  const currentPage = useInboxPaginationStore((state) => state.currentPage)
  const pageSize = useInboxPaginationStore((state) => state.pageSize)
  const groupBy = useInboxGroupStore((state) => state.groupBy)
  const collapsedGroups = useInboxGroupStore((state) => state.collapsedGroups)
  const columns = useInboxColumnStore((state) => state.columns)
  const visibleColumns = useMemo(() => columns.filter((col) => col.visible), [columns])

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
  const groupedData = useMemo(() => {
    return groupItems(sortedItems, groupBy)
  }, [sortedItems, groupBy])

  // ページネーション適用（グループ化なしの場合のみ）
  const paginatedItems = useMemo(() => {
    if (groupBy) return sortedItems
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedItems.slice(startIndex, endIndex)
  }, [sortedItems, currentPage, pageSize, groupBy])

  return (
    <TableBody>
      {paginatedItems.length === 0 ? (
        <InboxTableEmptyState columnCount={visibleColumns.length} totalItems={items.length} />
      ) : groupBy ? (
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
        <>
          {paginatedItems.map((item) => (
            <InboxTableRow key={item.id} item={item} />
          ))}
          <InboxTableRowCreate ref={createRowRef} />
          <TableRow className="pointer-events-none h-1" />
        </>
      )}
    </TableBody>
  )
})

/**
 * InboxTableContent - テーブル本体
 *
 * 役割分担:
 * - TableHeaderSection: 列表示・ソート・選択チェックボックス
 * - TableBodySection: データ表示・ソート・ページネーション・グループ化
 *
 * これにより、フィルター変更時はTableBodySectionのみ再レンダリング
 */
export const InboxTableContent = memo(function InboxTableContent({ items, createRowRef }: InboxTableContentProps) {
  // 選択関連のみ監視
  const selectedIds = useInboxSelectionStore((state) => state.selectedIds)
  const toggleAll = useInboxSelectionStore((state) => state.toggleAll)

  // ソート・ページネーション（選択状態の計算用）
  const sortField = useInboxSortStore((state) => state.sortField)
  const sortDirection = useInboxSortStore((state) => state.sortDirection)
  const currentPage = useInboxPaginationStore((state) => state.currentPage)
  const pageSize = useInboxPaginationStore((state) => state.pageSize)
  const groupBy = useInboxGroupStore((state) => state.groupBy)

  // 選択状態の計算用にソート・ページネーション適用
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

  const paginatedItems = useMemo(() => {
    if (groupBy) return sortedItems
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedItems.slice(startIndex, endIndex)
  }, [sortedItems, currentPage, pageSize, groupBy])

  // 全選択状態の計算
  const currentPageIds = useMemo(() => paginatedItems.map((item) => item.id), [paginatedItems])
  const selectedCountInPage = useMemo(
    () => currentPageIds.filter((id) => selectedIds.has(id)).length,
    [currentPageIds, selectedIds]
  )
  const allSelected = selectedCountInPage === currentPageIds.length && currentPageIds.length > 0
  const someSelected = selectedCountInPage > 0 && selectedCountInPage < currentPageIds.length

  const handleToggleAll = () => {
    toggleAll(currentPageIds)
  }

  return (
    <Table className="w-full">
      <TableHeaderSection allSelected={allSelected} someSelected={someSelected} onToggleAll={handleToggleAll} />
      <TableBodySection items={items} createRowRef={createRowRef} />
    </Table>
  )
})
