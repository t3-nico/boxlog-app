'use client'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useMemo } from 'react'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { SortableTableHead } from './table/SortableTableHead'
import { TableToolbar } from './table/TableToolbar'

/**
 * ステータスバッジ表示
 */
function StatusBadge({ status }: { status: TicketStatus }) {
  const statusConfig: Record<
    TicketStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    backlog: { label: '準備中', variant: 'secondary' },
    ready: { label: '配置済み', variant: 'outline' },
    active: { label: '作業中', variant: 'default' },
    wait: { label: '待ち', variant: 'secondary' },
    done: { label: '完了', variant: 'outline' },
    cancel: { label: '中止', variant: 'destructive' },
  }

  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

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
  const { items, isLoading, error } = useInboxData({
    status: filters.status[0] as TicketStatus | undefined,
    search: filters.search,
  })
  const { openInspector } = useTicketInspectorStore()

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

      {/* テーブル */}
      <div className="flex-1 overflow-auto px-4 md:px-6">
        <Table>
          <TableHeader>
            <TableRow>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-muted-foreground">アイテムがありません</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => openInspector(item.id)}
                >
                  {/* チケット番号 */}
                  <TableCell className="font-mono text-xs">{item.ticket_number || '-'}</TableCell>

                  {/* タイトル */}
                  <TableCell className="font-medium">{item.title}</TableCell>

                  {/* ステータス */}
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>

                  {/* タグ */}
                  <TableCell>
                    <div className="flex gap-1">
                      {item.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {item.tags && item.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                      {!item.tags || item.tags.length === 0 ? (
                        <span className="text-muted-foreground text-xs">-</span>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* 期限 */}
                  <TableCell className="text-muted-foreground text-sm">
                    {item.due_date
                      ? formatDistanceToNow(new Date(item.due_date), {
                          addSuffix: true,
                          locale: ja,
                        })
                      : '-'}
                  </TableCell>

                  {/* 作成日時 */}
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
