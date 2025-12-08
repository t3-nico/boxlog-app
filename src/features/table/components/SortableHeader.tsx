'use client'

import { TableHead } from '@/components/ui/table'
import { ArrowDown, ArrowUp, ArrowUpDown, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

import type { SortDirection } from '../stores/createTableSortStore'

export interface SortableHeaderProps<TColumnId extends string, TSortField extends string> {
  /** 列ID */
  columnId: TColumnId
  /** 表示ラベル */
  label: string
  /** 列幅 */
  width: number
  /** リサイズ可能か */
  resizable?: boolean
  /** ソート対象フィールド（指定しない場合はソート不可） */
  sortField?: TSortField
  /** 現在のソートフィールド */
  currentSortField: TSortField | null
  /** 現在のソート方向 */
  currentSortDirection: SortDirection | null
  /** ソート変更時のコールバック */
  onSortChange: (field: TSortField) => void
  /** 列幅変更時のコールバック */
  onWidthChange?: (columnId: TColumnId, width: number) => void
  /** 列アイコン */
  icon?: LucideIcon
  /** 最小幅（デフォルト: 50） */
  minWidth?: number
  /** カスタムクラス名 */
  className?: string
}

/**
 * ソート・リサイズ対応のテーブルヘッダー
 *
 * features/table が提供する基本コンポーネント
 * inbox/tags 等で共通して使用
 *
 * @example
 * ```tsx
 * <SortableHeader
 *   columnId="title"
 *   label="タイトル"
 *   width={300}
 *   resizable
 *   sortField="title"
 *   currentSortField={sortStore.sortField}
 *   currentSortDirection={sortStore.sortDirection}
 *   onSortChange={sortStore.setSortField}
 *   onWidthChange={columnStore.setColumnWidth}
 * />
 * ```
 */
export function SortableHeader<TColumnId extends string, TSortField extends string>({
  columnId,
  label,
  width,
  resizable = false,
  sortField,
  currentSortField,
  currentSortDirection,
  onSortChange,
  onWidthChange,
  icon: ColumnIcon,
  minWidth = 50,
  className,
}: SortableHeaderProps<TColumnId, TSortField>) {
  const [isResizing, setIsResizing] = useState(false)

  // ソートアイコン
  const isActive = sortField && currentSortField === sortField
  const SortIcon = isActive ? (currentSortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  // リサイズ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !onWidthChange) return

    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = width

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX
      const newWidth = Math.max(minWidth, startWidth + diff)
      onWidthChange(columnId, newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // ソートハンドラー
  const handleSort = () => {
    if (sortField) {
      onSortChange(sortField)
    }
  }

  return (
    <TableHead
      className={className}
      style={{ width: `${width}px`, minWidth: `${width}px`, position: 'relative', maxWidth: `${width}px` }}
    >
      <div className="flex items-center gap-1">
        {sortField ? (
          <button
            type="button"
            onClick={handleSort}
            className="hover:bg-state-hover -ml-1 flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 transition-colors"
          >
            {ColumnIcon && <ColumnIcon className="text-muted-foreground size-4 shrink-0" />}
            <span className="truncate">{label}</span>
            <SortIcon className={`size-4 shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-1">
            {ColumnIcon && <ColumnIcon className="text-muted-foreground size-4 shrink-0" />}
            <span className="truncate">{label}</span>
          </div>
        )}
      </div>

      {/* リサイズハンドル */}
      {resizable && onWidthChange && (
        <div
          onMouseDown={handleMouseDown}
          className={`hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors ${
            isResizing ? 'bg-primary' : 'bg-transparent'
          }`}
          style={{ userSelect: 'none' }}
        />
      )}
    </TableHead>
  )
}
