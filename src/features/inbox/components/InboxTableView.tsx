'use client'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ColumnSizingState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import * as React from 'react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import { DataTableEmpty } from '@/features/table/components/data-table-empty'
import { DataTablePagination } from '@/features/table/components/data-table-pagination'
import { DataTableToolbar } from '@/features/table/components/data-table-toolbar'
import { api } from '@/lib/trpc'
import { toast } from 'sonner'
import type { InboxItem } from '../hooks/useInboxData'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxTableFilterStore } from '../stores/useInboxTableFilterStore'
import { getInboxTableColumns } from './inbox-table-columns'

/**
 * Inbox Table View Component
 *
 * Tickets/Sessionsを統合したテーブルビュー
 *
 * @example
 * ```tsx
 * <InboxTableView />
 * ```
 */
export function InboxTableView() {
  // データ取得（Phase 1-Bで実装したuseInboxData）
  const { items, isLoading, error } = useInboxData()

  // フィルタ状態（Phase 1-Cで実装したuseInboxTableFilterStore）
  const { status, priority, tags, search } = useInboxTableFilterStore()

  // Inspector store
  const { open: openInspector } = useTicketInspectorStore()

  // tRPC mutations
  const utils = api.useUtils()
  const deleteTicketMutation = api.tickets.delete.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate()
    },
  })
  const deleteSessionMutation = api.tickets.sessions.delete.useMutation({
    onSuccess: () => {
      utils.tickets.sessions.list.invalidate()
    },
  })

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({})

  // アクションハンドラー
  const handleView = React.useCallback(
    (item: InboxItem) => {
      if (item.type === 'ticket') {
        openInspector('view-ticket', item.id)
      } else {
        console.log('Session view is not implemented yet:', item.id)
      }
    },
    [openInspector]
  )

  const handleEdit = React.useCallback(
    (item: InboxItem) => {
      if (item.type === 'ticket') {
        openInspector('edit-ticket', item.id)
      } else {
        console.log('Session edit is not implemented yet:', item.id)
      }
    },
    [openInspector]
  )

  const handleDelete = React.useCallback(
    async (item: InboxItem) => {
      const itemType = item.type === 'ticket' ? 'チケット' : 'セッション'
      const itemTitle = item.title

      try {
        if (item.type === 'ticket') {
          await deleteTicketMutation.mutateAsync({ id: item.id })
        } else {
          await deleteSessionMutation.mutateAsync({ id: item.id })
        }
        toast.success(`${itemType}を削除しました`, {
          description: `「${itemTitle}」を削除しました`,
        })
      } catch (error) {
        console.error('Failed to delete item:', error)
        toast.error(`${itemType}の削除に失敗しました`, {
          description: error instanceof Error ? error.message : '不明なエラーが発生しました',
        })
      }
    },
    [deleteTicketMutation, deleteSessionMutation]
  )

  // カラム定義
  const columns = React.useMemo(
    () =>
      getInboxTableColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleView, handleEdit, handleDelete]
  )

  // フィルタリング適用
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // ステータスフィルタ
      if (status.length > 0 && !status.includes(item.status)) {
        return false
      }

      // 優先度フィルタ（Ticketのみ）
      if (priority.length > 0 && item.type === 'ticket') {
        if (!item.priority || !priority.includes(item.priority)) {
          return false
        }
      }

      // 検索フィルタ
      if (search) {
        const searchLower = search.toLowerCase()
        if (!item.title.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // タグフィルタ（将来実装予定）
      // tags は将来の実装のため、現在は使用していない
      // if (tags.length > 0) {
      //   // TODO: タグフィルタリング実装
      // }

      return true
    })
  }, [items, status, priority, search])

  // 行クリックハンドラー
  const handleRowClick = React.useCallback(
    (itemId: string, itemType: 'ticket' | 'session') => {
      console.log('[InboxTableView] Row clicked:', { itemId, itemType })
      if (itemType === 'ticket') {
        console.log('[InboxTableView] Opening inspector for ticket:', itemId)
        openInspector('edit-ticket', itemId)
      } else {
        // Session用のInspectorは将来実装予定
        console.log('Session Inspector is not implemented yet:', itemId)
      }
    },
    [openInspector]
  )

  // TanStack Table インスタンス
  const table = useReactTable({
    data: filteredItems,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnSizing,
    },
    enableRowSelection: true,
    enableSorting: true,
    columnResizeMode: 'onChange',
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // 一括削除ハンドラー（tableが定義された後に定義）
  const handleDeleteSelected = React.useCallback(async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) return

    try {
      await Promise.all(
        selectedRows.map((row) => {
          const item = row.original
          if (item.type === 'ticket') {
            return deleteTicketMutation.mutateAsync({ id: item.id })
          } else {
            return deleteSessionMutation.mutateAsync({ id: item.id })
          }
        })
      )
      // 選択をクリア
      table.resetRowSelection()
    } catch (error) {
      console.error('Failed to delete selected items:', error)
      // TODO: トーストで一括削除失敗を通知
    }
  }, [table, deleteTicketMutation, deleteSessionMutation])

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  // エラー状態
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-destructive">エラーが発生しました: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* ツールバー: フィルター・検索 */}
      <div className="flex shrink-0 px-4 py-4 md:px-6">
        <DataTableToolbar table={table} onDeleteSelected={handleDeleteSelected} />
      </div>

      {/* テーブル: 残りのスペース */}
      <div className="flex-1 overflow-hidden px-4 md:px-6">
        <ScrollArea className="border-input h-full rounded-md border">
          <Table style={{ minWidth: table.getTotalSize() }}>
            <TableCaption className="sr-only">Inbox一覧テーブル</TableCaption>
            <TableHeader className="bg-background sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} style={{ width: header.getSize(), position: 'relative' }}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {/* リサイズハンドル */}
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none ${
                            header.column.getIsResizing() ? 'bg-primary' : 'hover:bg-primary/50'
                          }`}
                        />
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => {
                      const isClickable = cell.column.id !== 'select' && cell.column.id !== 'actions'
                      return (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          onClick={isClickable ? () => handleRowClick(row.original.id, row.original.type) : undefined}
                          className={isClickable ? 'cursor-pointer' : ''}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <DataTableEmpty />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* ページネーション */}
        <div className="px-4 py-4 md:px-6">
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  )
}
