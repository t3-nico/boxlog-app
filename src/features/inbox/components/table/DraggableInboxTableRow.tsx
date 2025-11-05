'use client'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TableCell, TableRow } from '@/components/ui/table'
import { TicketStatusBadge } from '@/features/tickets/components/display/TicketStatusBadge'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { GripVertical } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { InboxItem } from '../../hooks/useInboxData'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'
import { useInboxFocusStore } from '../../stores/useInboxFocusStore'
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore'

interface DraggableInboxTableRowProps {
  /** 表示するInboxアイテム */
  item: InboxItem
  /** ドラッグが有効かどうか */
  isDragEnabled?: boolean
}

/**
 * ドラッグ可能なInboxテーブル行コンポーネント
 *
 * InboxTableRowにドラッグ&ドロップ機能を追加
 * - @dnd-kit/sortable でドラッグ&ドロップを実現
 * - 手動ソートモード時のみドラッグハンドルを表示
 * - 既存の Inspector、選択、フォーカス機能はそのまま
 *
 * @example
 * ```tsx
 * <DraggableInboxTableRow item={item} isDragEnabled={true} />
 * ```
 */
export function DraggableInboxTableRow({ item, isDragEnabled = false }: DraggableInboxTableRowProps) {
  const { openInspector } = useTicketInspectorStore()
  const { isSelected, toggleSelection } = useInboxSelectionStore()
  const { getVisibleColumns } = useInboxColumnStore()
  const { focusedId, setFocusedId } = useInboxFocusStore()

  const rowRef = useRef<HTMLTableRowElement>(null)
  const selected = isSelected(item.id)
  const isFocused = focusedId === item.id
  const visibleColumns = getVisibleColumns()

  // dnd-kit sortable
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !isDragEnabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // フォーカスされた行をスクロールして表示
  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [isFocused])

  // 列IDをキーにセルをレンダリング
  const renderCell = (columnId: string) => {
    switch (columnId) {
      case 'selection':
        return (
          <TableCell key={columnId} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {/* ドラッグハンドル */}
              {isDragEnabled && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="size-4" />
                </button>
              )}
              <Checkbox checked={selected} onCheckedChange={() => toggleSelection(item.id)} />
            </div>
          </TableCell>
        )

      case 'ticket_number':
        return (
          <TableCell key={columnId} className="font-mono text-xs">
            {item.ticket_number || '-'}
          </TableCell>
        )

      case 'title':
        return (
          <TableCell key={columnId} className="font-medium">
            {item.title}
          </TableCell>
        )

      case 'status':
        return (
          <TableCell key={columnId}>
            <TicketStatusBadge status={item.status} />
          </TableCell>
        )

      case 'tags':
        return (
          <TableCell key={columnId}>
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
              {!item.tags || item.tags.length === 0 ? <span className="text-muted-foreground text-xs">-</span> : null}
            </div>
          </TableCell>
        )

      case 'due_date':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm">
            {item.due_date
              ? formatDistanceToNow(new Date(item.due_date), {
                  addSuffix: true,
                  locale: ja,
                })
              : '-'}
          </TableCell>
        )

      case 'created_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
              locale: ja,
            })}
          </TableCell>
        )

      default:
        return null
    }
  }

  return (
    <TableRow
      ref={(node) => {
        setNodeRef(node)
        if (rowRef) {
          ;(rowRef as any).current = node
        }
      }}
      style={style}
      className={cn(
        'hover:bg-muted/50 cursor-pointer transition-colors',
        isFocused && 'bg-accent/50 ring-primary ring-2 ring-inset'
      )}
      onClick={() => {
        openInspector(item.id)
        setFocusedId(item.id)
      }}
    >
      {visibleColumns.map((column) => renderCell(column.id))}
    </TableRow>
  )
}
