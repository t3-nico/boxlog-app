'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { InboxItem } from '@/features/inbox/hooks/useInboxData'
import { TicketTagSelectDialogEnhanced } from '@/features/tickets/components/shared/TicketTagSelectDialogEnhanced'
import { useTicketTags } from '@/features/tickets/hooks/useTicketTags'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import { configToReadable, ruleToConfig } from '@/features/tickets/utils/rrule'
import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Bell, Calendar as CalendarIcon, Plus, Repeat, Tag } from 'lucide-react'

import { useBoardFocusStore } from '../../stores/useBoardFocusStore'
import { BoardActionMenuItems } from '../BoardActionMenuItems'

interface TicketCardProps {
  item: InboxItem
}

/**
 * TicketCard - Ticket表示用カードコンポーネント
 *
 * **機能**:
 * - ドラッグ可能（useDraggable）
 * - 日時編集（Popover）
 * - タグ編集（TicketTagSelectDialogEnhanced）
 * - コンテキストメニュー（編集・複製・削除等）
 *
 * **使用箇所**:
 * - TicketKanbanBoard（Kanbanボード）
 * - InboxCardList（Calendar Sidebar）
 */
export function TicketCard({ item }: TicketCardProps) {
  const { openInspector, ticketId } = useTicketInspectorStore()
  const { focusedId, setFocusedId } = useBoardFocusStore()
  const { addTicketTag, removeTicketTag } = useTicketTags()
  const isActive = ticketId === item.id
  const isFocused = focusedId === item.id

  // ドラッグ可能にする
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  // ドラッグ時のスタイル
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  // 通知設定: UI文字列形式（'', '開始時刻', '10分前', ...）
  const [reminderType, setReminderType] = useState<string>('')

  // タグ変更ハンドラー
  const handleTagsChange = async (tagIds: string[]) => {
    const currentTagIds = item.tags?.map((tag) => tag.id) ?? []
    const addedTagIds = tagIds.filter((id) => !currentTagIds.includes(id))
    const removedTagIds = currentTagIds.filter((id) => !tagIds.includes(id))

    // タグを追加
    for (const tagId of addedTagIds) {
      await addTicketTag(item.id, tagId)
    }

    // タグを削除
    for (const tagId of removedTagIds) {
      await removeTicketTag(item.id, tagId)
    }
  }

  // 表示用の日時フォーマット
  const getDisplayContent = () => {
    if (!item.due_date && !item.start_time && !item.end_time) return null

    const dateStr = item.due_date ? format(new Date(item.due_date), 'yyyy/MM/dd', { locale: ja }) : ''
    let timeStr = ''

    if (item.start_time && item.end_time) {
      timeStr = ` ${format(new Date(item.start_time), 'HH:mm')} → ${format(new Date(item.end_time), 'HH:mm')}`
    } else if (item.start_time) {
      timeStr = ` ${format(new Date(item.start_time), 'HH:mm')}`
    }

    return (
      <span>
        {dateStr}
        {timeStr}
      </span>
    )
  }

  const handleClick = () => {
    if (item.type === 'ticket') {
      openInspector(item.id)
    }
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

  return (
    <>
      <ContextMenu
        modal={false}
        onOpenChange={(open) => {
          if (open) {
            // メニューを開いたときにフォーカスを設定
            setFocusedId(item.id)
          } else {
            // メニューを閉じたときにフォーカスをクリア
            setFocusedId(null)
          }
        }}
      >
        <ContextMenuTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={cn(
              'bg-card hover:bg-muted/50 border-border group flex cursor-pointer flex-col gap-2 rounded-lg border p-3 shadow-sm transition-colors',
              isActive && 'border-primary',
              isFocused && 'bg-primary/10 hover:bg-primary/15',
              isDragging && 'opacity-50'
            )}
          >
            {/* 1. タイトル */}
            <div className="flex items-center gap-2 overflow-hidden">
              <h3 className="text-foreground min-w-0 text-base leading-tight font-semibold hover:underline">
                {item.title}
              </h3>
              {item.ticket_number && (
                <span className="text-muted-foreground shrink-0 text-sm">#{item.ticket_number}</span>
              )}
            </div>

            {/* 2. 日付・時間 */}
            <div
              className="text-foreground hover:bg-primary/10 group/date flex w-fit cursor-pointer items-center gap-2 rounded py-0.5 text-sm transition-colors"
              onClick={(e) => {
                // カードクリックイベントの伝播を防止し、Inspectorを開く
                e.stopPropagation()
                openInspector(item.id)
              }}
            >
              {getDisplayContent() || (
                <div className="text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  <span>日付を追加</span>
                </div>
              )}

              {/* アイコンコンテナ（Repeat と Reminder を gap-1 でグループ化） */}
              {(item.recurrence_rule ||
                (item.recurrence_type && item.recurrence_type !== 'none') ||
                reminderType !== 'none') && (
                <div className="flex items-center gap-1">
                  {/* 繰り返しアイコン（設定時のみ表示） */}
                  {(item.recurrence_rule || (item.recurrence_type && item.recurrence_type !== 'none')) && (
                    <div
                      title={
                        item.recurrence_rule
                          ? configToReadable(ruleToConfig(item.recurrence_rule))
                          : item.recurrence_type === 'daily'
                            ? '毎日'
                            : item.recurrence_type === 'weekly'
                              ? '毎週'
                              : item.recurrence_type === 'monthly'
                                ? '毎月'
                                : item.recurrence_type === 'yearly'
                                  ? '毎年'
                                  : item.recurrence_type === 'weekdays'
                                    ? '平日'
                                    : ''
                      }
                    >
                      <Repeat className="text-muted-foreground size-4" />
                    </div>
                  )}

                  {/* 通知アイコン（設定時のみ表示） */}
                  {reminderType !== 'none' && (
                    <div
                      title={
                        reminderType === '5min'
                          ? '5分前'
                          : reminderType === '15min'
                            ? '15分前'
                            : reminderType === '30min'
                              ? '30分前'
                              : reminderType === '1hour'
                                ? '1時間前'
                                : reminderType === '1day'
                                  ? '1日前'
                                  : ''
                      }
                    >
                      <Bell className="text-muted-foreground size-4" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Tags */}
            <TicketTagSelectDialogEnhanced
              selectedTagIds={item.tags?.map((tag) => tag.id) ?? []}
              onTagsChange={handleTagsChange}
            >
              {item.tags && item.tags.length > 0 ? (
                <div
                  className="group/tags flex flex-wrap gap-1"
                  onClick={(e) => {
                    // カードクリックイベントの伝播を防止
                    e.stopPropagation()
                  }}
                >
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="shrink-0 text-xs font-normal"
                      style={
                        tag.color
                          ? {
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                              color: tag.color,
                            }
                          : undefined
                      }
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {item.tags.length > 4 && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      +{item.tags.length - 4}
                    </Badge>
                  )}
                  {/* +アイコン（常時表示） */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 text-muted-foreground h-5 w-5 shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                /* タグなしの場合は「タグを追加」 */
                <div
                  className="hover:bg-primary/10 group/tags flex w-fit cursor-pointer flex-wrap gap-1 rounded py-0.5 transition-colors"
                  onClick={(e) => {
                    // カードクリックイベントの伝播を防止
                    e.stopPropagation()
                  }}
                >
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Tag className="size-3" />
                    <span>タグを追加</span>
                  </div>
                </div>
              )}
            </TicketTagSelectDialogEnhanced>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <BoardActionMenuItems
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
    </>
  )
}
