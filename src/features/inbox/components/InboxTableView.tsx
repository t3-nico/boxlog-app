'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { useEffect, useMemo } from 'react'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore'
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { BulkActionsToolbar } from './table/BulkActionsToolbar'
import { InboxTableRow } from './table/InboxTableRow'
import { SortableTableHead } from './table/SortableTableHead'
import { TablePagination } from './table/TablePagination'
import { TableToolbar } from './table/TableToolbar'

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
  const { sortField, sortDirection } = useInboxSortStore()
  const { currentPage, pageSize, setCurrentPage } = useInboxPaginationStore()
  const { selectedIds, toggleAll } = useInboxSelectionStore()
  const { items, isLoading, error } = useInboxData({
    status: filters.status[0] as TicketStatus | undefined,
    search: filters.search,
  })

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

  // ページネーション適用
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedItems.slice(startIndex, endIndex)
  }, [sortedItems, currentPage, pageSize])

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
      <div className="flex shrink-0 px-4 py-4 md:px-6">
        <TableToolbar />
      </div>

      {/* 一括操作ツールバー */}
      <BulkActionsToolbar />

      {/* テーブル */}
      <div className="flex-1 overflow-auto px-4 md:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={handleToggleAll}
                />
              </TableHead>
              <SortableTableHead field="ticket_number" className="w-[80px]">
                #
              </SortableTableHead>
              <SortableTableHead field="title" className="min-w-[200px]">
                タイトル
              </SortableTableHead>
              <SortableTableHead field="status" className="w-[120px]">
                ステータス
              </SortableTableHead>
              <TableHead className="w-[200px]">タグ</TableHead>
              <SortableTableHead field="due_date" className="w-[140px]">
                期限
              </SortableTableHead>
              <SortableTableHead field="created_at" className="w-[140px]">
                作成日時
              </SortableTableHead>
              <TableHead className="w-[70px]">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <p className="text-muted-foreground">アイテムがありません</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => <InboxTableRow key={item.id} item={item} />)
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション */}
      <TablePagination totalItems={sortedItems.length} />
    </div>
  )
}
