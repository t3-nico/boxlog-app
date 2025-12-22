'use client'

import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Inbox } from 'lucide-react'

export interface TableEmptyStateProps {
  /** 列数（colspan） */
  columnCount: number
  /** メッセージ */
  message?: string
  /** サブメッセージ */
  subMessage?: string
  /** フィルター適用中か */
  isFiltered?: boolean
  /** フィルターリセットコールバック */
  onResetFilter?: () => void
}

/**
 * テーブル空状態の表示
 *
 * @example
 * ```tsx
 * <TableEmptyState
 *   columnCount={columns.length}
 *   message="データがありません"
 *   isFiltered={hasFilters}
 *   onResetFilter={resetFilters}
 * />
 * ```
 */
export function TableEmptyState({
  columnCount,
  message = 'データがありません',
  subMessage,
  isFiltered = false,
  onResetFilter,
}: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Inbox className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">{message}</p>
          {subMessage && <p className="text-muted-foreground text-xs">{subMessage}</p>}
          {isFiltered && onResetFilter && (
            <Button type="button" variant="text" onClick={onResetFilter}>
              フィルターをリセット
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
