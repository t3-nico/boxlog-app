import { Checkbox } from '@/components/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import { parseDatetimeString } from '@/features/calendar/utils/dateUtils'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { useTicketTags } from '@/features/tickets/hooks/useTicketTags'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useRef } from 'react'
import type { InboxItem } from '../../hooks/useInboxData'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'
import { useInboxFocusStore } from '../../stores/useInboxFocusStore'
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore'
import { DateTimeUnifiedCell } from './DateTimeUnifiedCell'
import { InboxActionMenuItems } from './InboxActionMenuItems'
import { StatusEditCell } from './StatusEditCell'
import { TagsCell } from './TagsCell'

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
  const { isSelected, setSelectedIds } = useInboxSelectionStore()
  const { getVisibleColumns } = useInboxColumnStore()
  const { focusedId, setFocusedId } = useInboxFocusStore()
  const { updateTicket } = useTicketMutations()
  const { addTicketTag, removeTicketTag } = useTicketTags()

  const rowRef = useRef<HTMLTableRowElement>(null)
  const selected = isSelected(item.id)
  const isFocused = focusedId === item.id
  const visibleColumns = getVisibleColumns()

  // インライン編集ハンドラー
  const handleStatusChange = (status: TicketStatus) => {
    // TODO: APIでステータスを更新
    console.log('Update status:', item.id, status)
  }

  const handleTagsChange = async (tagIds: string[]) => {
    const currentTagIds = item.tags?.map((tag) => tag.id) ?? []
    const addedTagIds = tagIds.filter((id) => !currentTagIds.includes(id))
    const removedTagIds = currentTagIds.filter((id) => !tagIds.includes(id))

    // NOTE: 現在は個別にタグを追加・削除していますが、
    // 将来的には一括設定API（setTicketTags）を使用して効率化する予定です。
    // 一括設定APIは、現在のタグをすべて削除してから新しいタグを設定するため、
    // 複数のタグ変更を1回のAPIコールで完了できます。

    // タグを追加
    for (const tagId of addedTagIds) {
      await addTicketTag(item.id, tagId)
    }

    // タグを削除
    for (const tagId of removedTagIds) {
      await removeTicketTag(item.id, tagId)
    }
  }

  const handleStartTimeChange = (startTime: string | null) => {
    // TODO: APIで開始日時を更新
    console.log('Update start time:', item.id, startTime)
  }

  const handleEndTimeChange = (endTime: string | null) => {
    // TODO: APIで終了日時を更新
    console.log('Update end time:', item.id, endTime)
  }

  const handleDueDateChange = (dueDate: string | null) => {
    updateTicket.mutate({
      id: item.id,
      data: {
        due_date: dueDate ? dueDate.split('T')[0] : undefined, // ISO 8601 → YYYY-MM-DD
      },
    })
  }

  // コンテキストメニューアクション
  const handleEdit = (item: InboxItem) => {
    openInspector(item.id)
  }

  const handleDuplicate = (item: InboxItem) => {
    // TODO: 複製機能実装
    console.log('Duplicate:', item.id)
  }

  const handleAddTags = (item: InboxItem) => {
    // TODO: タグ追加機能実装
    console.log('Add tags:', item.id)
  }

  const handleChangeDueDate = (item: InboxItem) => {
    // TODO: 期限変更機能実装
    console.log('Change due date:', item.id)
  }

  const handleArchive = (item: InboxItem) => {
    // TODO: アーカイブ機能実装
    console.log('Archive:', item.id)
  }

  const handleDelete = (item: InboxItem) => {
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
    const style = column
      ? { width: `${column.width}px`, minWidth: `${column.width}px`, maxWidth: `${column.width}px` }
      : undefined

    switch (columnId) {
      case 'selection':
        return (
          <TableCell key={columnId} onClick={(e) => e.stopPropagation()} style={style}>
            <Checkbox
              checked={selected}
              onCheckedChange={() => {
                if (selected) {
                  // 選択解除: 選択済みIDから削除
                  const newSelection = Array.from(useInboxSelectionStore.getState().getSelectedIds()).filter(
                    (id) => id !== item.id
                  )
                  setSelectedIds(newSelection)
                } else {
                  // 選択: 選択済みIDに追加
                  const newSelection = [...Array.from(useInboxSelectionStore.getState().getSelectedIds()), item.id]
                  setSelectedIds(newSelection)
                }
              }}
            />
          </TableCell>
        )

      case 'id':
        return (
          <TableCell key={columnId} className="font-mono text-sm" style={style}>
            <div className="truncate">{item.ticket_number || '-'}</div>
          </TableCell>
        )

      case 'title':
        return (
          <TableCell key={columnId} className="font-medium" style={style}>
            <div className="group flex cursor-pointer items-center gap-2 overflow-hidden">
              <span className="min-w-0 truncate group-hover:underline">{item.title}</span>
              {item.ticket_number && (
                <span className="text-muted-foreground shrink-0 text-sm">#{item.ticket_number}</span>
              )}
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
        return <TagsCell key={columnId} tags={item.tags ?? []} width={column?.width} onTagsChange={handleTagsChange} />

      case 'duration':
        return (
          <DateTimeUnifiedCell
            key={columnId}
            data={{
              date: item.start_time ? parseDatetimeString(item.start_time).toISOString().split('T')[0] : null,
              startTime: item.start_time ? format(parseDatetimeString(item.start_time), 'HH:mm') : null,
              endTime: item.end_time ? format(parseDatetimeString(item.end_time), 'HH:mm') : null,
              reminder: null,
              recurrence: null,
            }}
            width={column?.width}
            onChange={(data) => {
              // 日付+時刻をISO 8601形式に変換
              const startTime = data.date && data.startTime ? `${data.date}T${data.startTime}:00Z` : null
              const endTime = data.date && data.endTime ? `${data.date}T${data.endTime}:00Z` : null

              updateTicket.mutate({
                id: item.id,
                data: {
                  start_time: startTime || undefined,
                  end_time: endTime || undefined,
                },
              })
            }}
          />
        )

      case 'created_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm" style={style}>
            {format(new Date(item.created_at), 'yyyy/MM/dd', { locale: ja })}
          </TableCell>
        )

      case 'updated_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm" style={style}>
            {format(new Date(item.updated_at), 'yyyy/MM/dd', { locale: ja })}
          </TableCell>
        )

      default:
        return null
    }
  }

  return (
    <ContextMenu modal={false}>
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
          onContextMenu={() => {
            // 右クリックされた行を選択（Tagsテーブルと同様）
            if (!selected) {
              setSelectedIds([item.id])
            }
          }}
        >
          {visibleColumns.map((column) => renderCell(column.id))}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <InboxActionMenuItems
          item={item}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onAddTags={handleAddTags}
          onChangeDueDate={handleChangeDueDate}
          onArchive={handleArchive}
          onDelete={handleDelete}
          renderMenuItem={({ icon, label, onClick, variant }) => (
            <ContextMenuItem onClick={onClick} className={variant === 'destructive' ? 'text-destructive' : ''}>
              {icon}
              {label}
            </ContextMenuItem>
          )}
          renderSeparator={() => <ContextMenuSeparator />}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}
