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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { InboxItem } from '@/features/inbox/hooks/useInboxData'
import { DateTimePopoverContent } from '@/features/tickets/components/shared/DateTimePopoverContent'
import { TicketTagSelectDialogEnhanced } from '@/features/tickets/components/shared/TicketTagSelectDialogEnhanced'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { useTicketTags } from '@/features/tickets/hooks/useTicketTags'
import { useTicketCacheStore } from '@/features/tickets/stores/useTicketCacheStore'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import { toLocalISOString } from '@/features/tickets/utils/datetime'
import { minutesToReminderType, reminderTypeToMinutes } from '@/features/tickets/utils/reminder'
import { configToReadable, ruleToConfig } from '@/features/tickets/utils/rrule'
import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Bell, Calendar as CalendarIcon, Plus, Repeat, Tag, Trash2 } from 'lucide-react'

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
  const { updateTicket } = useTicketMutations()
  const { getCache } = useTicketCacheStore()
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

  // 日時編集用の状態
  const [dateTimeOpen, setDateTimeOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    item.due_date ? new Date(item.due_date) : undefined
  )
  const [startTime, setStartTime] = useState(item.start_time ? format(new Date(item.start_time), 'HH:mm') : '')
  const [endTime, setEndTime] = useState(item.end_time ? format(new Date(item.end_time), 'HH:mm') : '')
  // 通知設定: UI文字列形式（'', '開始時刻', '10分前', ...）
  const [reminderType, setReminderType] = useState<string>(minutesToReminderType(item.reminder_minutes))

  // 繰り返し設定（Zustandキャッシュから取得、なければitemから）
  const cache = getCache(item.id)
  const recurrenceType =
    cache?.recurrence_type !== undefined
      ? cache.recurrence_type === 'none' || !cache.recurrence_type
        ? 'none'
        : cache.recurrence_type
      : item.recurrence_type === 'none' || !item.recurrence_type
        ? 'none'
        : item.recurrence_type
  const recurrenceRule = cache?.recurrence_rule !== undefined ? cache.recurrence_rule : (item.recurrence_rule ?? null)

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

  // 日時データ変更ハンドラー
  const handleDateTimeChange = () => {
    updateTicket.mutate({
      id: item.id,
      data: {
        due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        start_time:
          selectedDate && startTime ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), startTime) : undefined,
        end_time: selectedDate && endTime ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), endTime) : undefined,
        reminder_minutes: reminderTypeToMinutes(reminderType),
      },
    })
  }

  // 日時クリアハンドラー
  const handleDateTimeClear = () => {
    updateTicket.mutate({
      id: item.id,
      data: {
        due_date: undefined,
        start_time: undefined,
        end_time: undefined,
        reminder_minutes: null,
        recurrence_type: 'none',
        recurrence_rule: null,
      },
    })
    setSelectedDate(undefined)
    setStartTime('')
    setEndTime('')
    setReminderType('')
    setDateTimeOpen(false)
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
            <Popover open={dateTimeOpen} onOpenChange={setDateTimeOpen}>
              <PopoverTrigger asChild>
                <div
                  className="text-foreground hover:bg-primary/10 group/date flex w-fit cursor-pointer items-center gap-2 rounded py-0.5 text-sm transition-colors"
                  onClick={(e) => {
                    // カードクリックイベントの伝播を防止
                    e.stopPropagation()
                  }}
                >
                  {getDisplayContent() || (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      <span>日付を追加</span>
                    </div>
                  )}

                  {/* アイコンコンテナ（Repeat と Reminder を gap-1 でグループ化） */}
                  {(recurrenceRule ||
                    (recurrenceType && recurrenceType !== 'none') ||
                    (reminderType && reminderType !== 'none' && reminderType !== '')) && (
                    <div className="flex items-center gap-1">
                      {/* 繰り返しアイコン（設定時のみ表示） */}
                      {(recurrenceRule || (recurrenceType && recurrenceType !== 'none')) && (
                        <div
                          title={
                            recurrenceRule
                              ? configToReadable(ruleToConfig(recurrenceRule))
                              : recurrenceType === 'daily'
                                ? '毎日'
                                : recurrenceType === 'weekly'
                                  ? '毎週'
                                  : recurrenceType === 'monthly'
                                    ? '毎月'
                                    : recurrenceType === 'yearly'
                                      ? '毎年'
                                      : recurrenceType === 'weekdays'
                                        ? '平日'
                                        : ''
                          }
                        >
                          <Repeat className="text-muted-foreground size-4" />
                        </div>
                      )}

                      {/* 通知アイコン（設定時のみ表示） */}
                      {reminderType && reminderType !== 'none' && reminderType !== '' && (
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
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-3"
                align="start"
                onClick={(e) => {
                  // Popover内のクリックイベントがカードに伝播しないようにする
                  e.stopPropagation()
                }}
              >
                <div className="space-y-4">
                  <DateTimePopoverContent
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      setSelectedDate(date)
                      handleDateTimeChange()
                    }}
                    startTime={startTime}
                    onStartTimeChange={(time) => {
                      setStartTime(time)
                      handleDateTimeChange()
                    }}
                    endTime={endTime}
                    onEndTimeChange={(time) => {
                      setEndTime(time)
                      handleDateTimeChange()
                    }}
                    reminderType={reminderType}
                    onReminderChange={(value) => {
                      setReminderType(value)
                      handleDateTimeChange()
                    }}
                    recurrenceRule={recurrenceRule}
                    recurrenceType={recurrenceType}
                    onRepeatTypeChange={(type) => {
                      // 型マッピング
                      const typeMap: Record<string, 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'> = {
                        '': 'none',
                        毎日: 'daily',
                        毎週: 'weekly',
                        毎月: 'monthly',
                        毎年: 'yearly',
                        平日: 'weekdays',
                      }
                      const recurrenceType = typeMap[type] || 'none'

                      // optimistic updateがキャッシュを即座に更新
                      updateTicket.mutate({
                        id: item.id,
                        data: {
                          recurrence_type: recurrenceType,
                          recurrence_rule: null,
                        },
                      })
                    }}
                    onRecurrenceRuleChange={(rrule) => {
                      // optimistic updateがキャッシュを即座に更新
                      updateTicket.mutate({
                        id: item.id,
                        data: {
                          recurrence_rule: rrule,
                        },
                      })
                    }}
                  />

                  {/* アクションボタン */}
                  <div className="flex justify-end">
                    <Button onClick={handleDateTimeClear} variant="secondary" size="sm">
                      <Trash2 className="mr-2 size-4" />
                      クリア
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
                      className="shrink-0 gap-0.5 text-xs font-normal"
                      style={
                        tag.color
                          ? {
                              borderColor: tag.color,
                            }
                          : undefined
                      }
                    >
                      <span className="font-medium" style={tag.color ? { color: tag.color } : undefined}>
                        #
                      </span>
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
