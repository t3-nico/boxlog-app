'use client'

import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

import { EmptyState } from '@/components/common'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'

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
  /** カスタムアイコン */
  icon?: LucideIcon
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
  icon = Inbox,
}: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-64">
        <EmptyState
          icon={icon}
          title={message}
          description={subMessage}
          actions={
            isFiltered && onResetFilter ? (
              <Button type="button" variant="outline" onClick={onResetFilter}>
                フィルターをリセット
              </Button>
            ) : undefined
          }
        />
      </TableCell>
    </TableRow>
  )
}
