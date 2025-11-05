import { Checkbox } from '@/components/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Archive, Copy, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { InboxItem } from '../../hooks/useInboxData'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'
import { useInboxFocusStore } from '../../stores/useInboxFocusStore'
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore'
import { DueDateEditCell } from './DueDateEditCell'
import { StatusEditCell } from './StatusEditCell'
import { TagsEditCell } from './TagsEditCell'

interface InboxTableRowProps {
  /** 表示するInboxアイテム */
  item: InboxItem
}

/**
 * Inboxテーブル行コンポーネント
 *
 * 行の表示ロジックを独立したコンポーネントに分離
 * - Inspector表示
 * - 日付フォーマット
 * - タグ表示
 * - アクションメニュー
 *
 * @example
 * ```tsx
 * <InboxTableRow item={item} />
 * ```
 */
export function InboxTableRow({ item }: InboxTableRowProps) {
  const { openInspector } = useTicketInspectorStore()
  const { isSelected, toggleSelection } = useInboxSelectionStore()
  const { getVisibleColumns } = useInboxColumnStore()
  const { focusedId, setFocusedId } = useInboxFocusStore()

  const rowRef = useRef<HTMLTableRowElement>(null)
  const selected = isSelected(item.id)
  const isFocused = focusedId === item.id
  const visibleColumns = getVisibleColumns()

  // インライン編集ハンドラー
  const handleStatusChange = (status: TicketStatus) => {
    // TODO: APIでステータスを更新
    console.log('Update status:', item.id, status)
  }

  const handleTagsChange = (tags: InboxItem['tags']) => {
    // TODO: APIでタグを更新
    console.log('Update tags:', item.id, tags)
  }

  const handleDueDateChange = (dueDate: string | null) => {
    // TODO: APIで期限日を更新
    console.log('Update due date:', item.id, dueDate)
  }

  // コンテキストメニューアクション
  const handleEdit = () => {
    openInspector(item.id)
  }

  const handleDuplicate = () => {
    // TODO: 複製機能実装
    console.log('Duplicate:', item.id)
  }

  const handleArchive = () => {
    // TODO: アーカイブ機能実装
    console.log('Archive:', item.id)
  }

  const handleDelete = () => {
    // TODO: 削除機能実装
    console.log('Delete:', item.id)
  }

  // フォーカスされた行をスクロールして表示
  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [isFocused])

  // 列IDをキーにセルをレンダリング
  const renderCell = (columnId: string) => {
    // 列情報を取得して幅を適用
    const column = visibleColumns.find((col) => col.id === columnId)
    const style = column ? { width: `${column.width}px` } : undefined

    switch (columnId) {
      case 'selection':
        return (
          <TableCell key={columnId} onClick={(e) => e.stopPropagation()} style={style}>
            <Checkbox checked={selected} onCheckedChange={() => toggleSelection(item.id)} />
          </TableCell>
        )

      case 'ticket_number':
        return (
          <TableCell key={columnId} className="font-mono text-xs" style={style}>
            {item.ticket_number || '-'}
          </TableCell>
        )

      case 'title':
        return (
          <TableCell key={columnId} className="font-medium" style={style}>
            <div className="group cursor-pointer">
              <span className="group-hover:underline">{item.title}</span>
            </div>
          </TableCell>
        )

      case 'status':
        return (
          <StatusEditCell
            key={columnId}
            status={item.status}
            width={column?.width}
            onStatusChange={handleStatusChange}
          />
        )

      case 'tags':
        return (
          <TagsEditCell
            key={columnId}
            tags={item.tags}
            width={column?.width}
            onTagsChange={handleTagsChange}
            availableTags={[]}
          />
        )

      case 'due_date':
        return (
          <DueDateEditCell
            key={columnId}
            dueDate={item.due_date}
            width={column?.width}
            onDueDateChange={handleDueDateChange}
          />
        )

      case 'created_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm" style={style}>
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow
          ref={rowRef}
          className={cn(
            'hover:bg-muted/50 cursor-pointer transition-colors',
            selected && 'bg-primary/10 hover:bg-primary/15',
            isFocused && 'ring-primary ring-2 ring-inset'
          )}
          onClick={() => {
            openInspector(item.id)
            setFocusedId(item.id)
          }}
        >
          {visibleColumns.map((column) => renderCell(column.id))}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 size-4" />
          編集
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 size-4" />
          複製
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleArchive}>
          <Archive className="mr-2 size-4" />
          アーカイブ
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 size-4" />
          削除
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
