'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { InboxItem } from '@/features/inbox/hooks/useInboxData'
import { TicketTagSelectDialogEnhanced } from '@/features/tickets/components/shared/TicketTagSelectDialogEnhanced'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { useTicketTags } from '@/features/tickets/hooks/useTicketTags'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  ArrowRight,
  Bell,
  Calendar as CalendarIcon,
  Check,
  Clock,
  MoreVertical,
  Plus,
  Repeat,
  Tag,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useBoardFocusStore } from '../stores/useBoardFocusStore'
import { BoardActionMenuItems } from './BoardActionMenuItems'

interface TicketKanbanBoardProps {
  items: InboxItem[]
}

/**
 * Ticket/Session用Kanbanボード
 *
 * InboxItemをステータスごとに3カラムに分類して表示
 */
export function TicketKanbanBoard({ items }: TicketKanbanBoardProps) {
  // Ticketデータをカラムごとに分類
  const columns = {
    backlog: items.filter((item) => item.status === 'backlog'),
    ready: items.filter((item) => item.status === 'ready'),
    active: items.filter((item) => item.status === 'active'),
    wait: items.filter((item) => item.status === 'wait'),
    done: items.filter((item) => item.status === 'done'),
    cancel: items.filter((item) => item.status === 'cancel'),
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {/* Backlog カラム */}
      <KanbanColumn title="Backlog" count={columns.backlog.length} variant="default" status="backlog">
        {columns.backlog.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Ready カラム */}
      <KanbanColumn title="Ready" count={columns.ready.length} variant="ready" status="ready">
        {columns.ready.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Active カラム */}
      <KanbanColumn title="Active" count={columns.active.length} variant="active" status="active">
        {columns.active.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Wait カラム */}
      <KanbanColumn title="Wait" count={columns.wait.length} variant="wait" status="wait">
        {columns.wait.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Done カラム */}
      <KanbanColumn title="Done" count={columns.done.length} variant="done" status="done">
        {columns.done.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Cancel カラム */}
      <KanbanColumn title="Cancel" count={columns.cancel.length} variant="cancel" status="cancel">
        {columns.cancel.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>
    </div>
  )
}

interface KanbanColumnProps {
  title: string
  count: number
  variant: 'default' | 'ready' | 'active' | 'wait' | 'done' | 'cancel'
  status: 'backlog' | 'ready' | 'active' | 'wait' | 'done' | 'cancel'
  children: React.ReactNode
}

function KanbanColumn({ title, count, variant, status, children }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const { createTicket } = useTicketMutations()

  // タグ一覧を取得（TODO: tagsテーブルのパーミッション設定後に有効化）
  const allTags: never[] = []

  // タグ検索結果をフィルタリング
  const filteredTags = allTags.filter((tag: { name: string }) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  const bgColor = {
    default: 'bg-muted/50',
    ready: 'bg-cyan-50 dark:bg-cyan-950/20',
    active: 'bg-blue-50 dark:bg-blue-950/20',
    wait: 'bg-yellow-50 dark:bg-yellow-950/20',
    done: 'bg-green-50 dark:bg-green-950/20',
    cancel: 'bg-red-50 dark:bg-red-950/20',
  }[variant]

  const handleCreate = () => {
    if (!newTitle.trim()) return

    createTicket.mutate({
      title: newTitle,
      status,
      due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    })

    // リセット
    setNewTitle('')
    setSelectedDate(undefined)
    setSelectedTagIds([])
    setTagSearchQuery('')
    setShowCalendar(false)
    setShowTags(false)
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTitle('')
      setSelectedDate(undefined)
      setSelectedTagIds([])
      setTagSearchQuery('')
      setShowCalendar(false)
      setShowTags(false)
    }
  }

  return (
    <div className="flex min-w-[300px] flex-col rounded-lg">
      <div
        className={`${bgColor} flex items-center justify-between rounded-t-lg pt-2`}
        style={{ height: '48px', minHeight: '48px', maxHeight: '48px', paddingLeft: '16px', paddingRight: '16px' }}
      >
        <h3 className="text-foreground font-semibold">
          {title} <span className="text-muted-foreground">({count})</span>
        </h3>
        <div className="flex items-center gap-1">
          {/* ドロップダウンメニュー */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>すべて完了にする</DropdownMenuItem>
              <DropdownMenuItem>すべてアーカイブ</DropdownMenuItem>
              <DropdownMenuItem>カラムをクリア</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* プラスアイコン（ツールチップ付き） */}
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsAdding(true)}
                  disabled={isAdding}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>新規チケットを追加</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className={`${bgColor} flex-1 space-y-2 overflow-y-auto rounded-b-lg px-4 pt-4 pb-2`}>
        {children}

        {/* 新規作成フォーム（入力中） */}
        {isAdding && (
          <div className="bg-card border-border relative space-y-2 rounded-lg border p-3 shadow-sm">
            {/* タイトル入力 */}
            <Input
              autoFocus
              placeholder="タイトルを入力..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
            />

            {/* 選択されたTags表示 */}
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTagIds.map((tagId) => {
                  const tag = allTags.find((t: { id: string }) => t.id === tagId)
                  return (
                    <Badge key={tagId} variant="secondary" className="text-xs">
                      {tag ? (tag as { name: string }).name : tagId.slice(0, 4)}
                    </Badge>
                  )
                })}
              </div>
            )}

            {/* アイコンボタン */}
            <div className="flex items-center gap-1">
              {/* 日付アイコン */}
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                type="button"
                title="日付を設定"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
              </Button>

              {/* Tagsアイコン */}
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                type="button"
                title="タグを追加"
                onClick={() => setShowTags(!showTags)}
              >
                <Tag className="h-3.5 w-3.5" />
              </Button>

              {/* 作成ボタン */}
              <Button size="sm" className="ml-auto h-7 text-xs" onClick={handleCreate}>
                追加
              </Button>
            </div>

            {/* カレンダー展開 */}
            {showCalendar && (
              <div className="border-input bg-popover absolute top-full left-0 z-50 mt-1 rounded-md border shadow-md">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setShowCalendar(false)
                  }}
                />
              </div>
            )}

            {/* タグ検索ポップアップ */}
            {showTags && (
              <div className="border-input bg-popover absolute top-full left-0 z-50 mt-1 w-64 rounded-md border shadow-md">
                <Command>
                  <CommandInput placeholder="タグを検索..." value={tagSearchQuery} onValueChange={setTagSearchQuery} />
                  <CommandList>
                    <CommandEmpty>
                      <div className="py-2">
                        <p className="text-muted-foreground text-sm">タグが見つかりません</p>
                        {tagSearchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => {
                              // TODO: タグ作成機能を実装
                              console.log('Create tag:', tagSearchQuery)
                              setShowTags(false)
                            }}
                          >
                            「{tagSearchQuery}」を作成
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredTags.map((tag: { id: string; name: string }) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => {
                            const isSelected = selectedTagIds.includes(tag.id)
                            if (isSelected) {
                              setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id))
                            } else {
                              setSelectedTagIds([...selectedTagIds, tag.id])
                            }
                          }}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span>{tag.name}</span>
                            {selectedTagIds.includes(tag.id) && <Check className="h-4 w-4" />}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        )}

        {/* 新規追加ボタン（未入力時） */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-lg p-3 text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>新規追加</span>
          </button>
        )}
      </div>
    </div>
  )
}

function TicketCard({ item }: { item: InboxItem }) {
  const { openInspector, ticketId } = useTicketInspectorStore()
  const { focusedId, setFocusedId } = useBoardFocusStore()
  const { addTicketTag, removeTicketTag } = useTicketTags()
  const { updateTicket } = useTicketMutations()
  const isActive = ticketId === item.id
  const isFocused = focusedId === item.id

  // 日時編集用の状態
  const [dateTimeOpen, setDateTimeOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    item.due_date ? new Date(item.due_date) : undefined
  )
  const [startTime, setStartTime] = useState(item.start_time ? format(new Date(item.start_time), 'HH:mm') : '')
  const [endTime, setEndTime] = useState(item.end_time ? format(new Date(item.end_time), 'HH:mm') : '')
  const [reminderType, setReminderType] = useState<'none' | '5min' | '15min' | '30min' | '1hour' | '1day'>('none')
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')

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
        start_time: selectedDate && startTime ? `${format(selectedDate, 'yyyy-MM-dd')}T${startTime}:00Z` : undefined,
        end_time: selectedDate && endTime ? `${format(selectedDate, 'yyyy-MM-dd')}T${endTime}:00Z` : undefined,
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
      },
    })
    setSelectedDate(undefined)
    setStartTime('')
    setEndTime('')
    setReminderType('none')
    setRecurrence('none')
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
      <>
        <span>
          {dateStr}
          {timeStr}
        </span>
        {reminderType !== 'none' && <Bell className="size-4" />}
        {recurrence !== 'none' && <Repeat className="size-4" />}
      </>
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
          onClick={handleClick}
          className={cn(
            'bg-card hover:bg-muted/50 border-border group flex cursor-pointer flex-col gap-2 rounded-lg border p-3 shadow-sm transition-colors',
            isActive && 'border-primary',
            isFocused && 'bg-primary/10 hover:bg-primary/15'
          )}
        >
          {/* 1. タイトル */}
          <div className="flex items-start gap-2 overflow-hidden">
            <h3 className="text-foreground line-clamp-3 min-w-0 text-base leading-tight font-semibold hover:underline">
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
                className="text-muted-foreground hover:bg-primary/10 group/date flex w-fit cursor-pointer items-center gap-1 rounded py-0.5 text-sm transition-colors"
                onClick={(e) => {
                  // カードクリックイベントの伝播を防止
                  e.stopPropagation()
                }}
              >
                {getDisplayContent() || (
                  <>
                    <CalendarIcon className="size-3 opacity-0 transition-opacity group-hover/date:opacity-100" />
                    <span className="opacity-0 transition-opacity group-hover/date:opacity-100">日付を追加</span>
                  </>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto" align="start">
              <div className="space-y-4">
                {/* 日付選択 */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <CalendarIcon className="mr-2 size-4" />
                    <span>日付</span>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      handleDateTimeChange()
                    }}
                    locale={ja}
                    classNames={{
                      day: '!aspect-auto',
                      today: '!bg-transparent',
                    }}
                    className="w-fit border-none bg-transparent p-0 [&_.group\/day]:!aspect-auto [&_button]:!aspect-auto [&_button]:!h-8 [&_button]:!w-8 [&_button]:text-xs [&_nav]:!h-10 [&_table]:!mt-0 [&_table]:text-sm [&_td]:!aspect-auto [&_td]:!h-8 [&_td]:!w-8 [&_td]:p-0 [&_th]:!h-8 [&_th]:!w-8 [&_th]:p-0 [&_tr]:!mt-0"
                  />
                </div>

                {/* 時刻設定 */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Clock className="mr-2 size-4" />
                    <span>時刻</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1">
                      <label className="text-muted-foreground text-xs">開始</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                          setStartTime(e.target.value)
                          handleDateTimeChange()
                        }}
                        className="border-input flex h-9 w-[88px] gap-0 rounded-md border bg-transparent px-2 py-1 text-sm [&::-webkit-datetime-edit-fields-wrapper]:!gap-0 [&::-webkit-datetime-edit-hour-field]:!mr-0 [&::-webkit-datetime-edit-minute-field]:!ml-0"
                      />
                    </div>
                    <ArrowRight className="text-muted-foreground mb-2 size-4" />
                    <div className="space-y-1">
                      <label className="text-muted-foreground text-xs">終了</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => {
                          setEndTime(e.target.value)
                          handleDateTimeChange()
                        }}
                        className="border-input flex h-9 w-[88px] gap-0 rounded-md border bg-transparent px-2 py-1 text-sm [&::-webkit-datetime-edit-fields-wrapper]:!gap-0 [&::-webkit-datetime-edit-hour-field]:!mr-0 [&::-webkit-datetime-edit-minute-field]:!ml-0"
                      />
                    </div>
                  </div>
                </div>

                {/* リマインダー設定 */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Bell className="mr-2 size-4" />
                    <span>リマインダー</span>
                  </div>
                  <Select
                    value={reminderType}
                    onValueChange={(value) => {
                      setReminderType(value as any)
                      handleDateTimeChange()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="リマインダーなし" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      <SelectItem value="5min">5分前</SelectItem>
                      <SelectItem value="15min">15分前</SelectItem>
                      <SelectItem value="30min">30分前</SelectItem>
                      <SelectItem value="1hour">1時間前</SelectItem>
                      <SelectItem value="1day">1日前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 繰り返し設定 */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Repeat className="mr-2 size-4" />
                    <span>繰り返し</span>
                  </div>
                  <Select
                    value={recurrence}
                    onValueChange={(value) => {
                      setRecurrence(value as any)
                      handleDateTimeChange()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="繰り返しなし" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="monthly">毎月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                {/* +アイコン（ホバー時に表示） */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover/tags:opacity-100"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              /* タグなしの場合は「タグを追加」 */
              <div
                className="hover:bg-primary/10 group/tags flex w-fit cursor-pointer flex-wrap gap-1 rounded px-1 py-0.5 transition-colors"
                onClick={(e) => {
                  // カードクリックイベントの伝播を防止
                  e.stopPropagation()
                }}
              >
                <div className="text-muted-foreground flex items-center gap-1 text-xs opacity-0 transition-opacity group-hover/tags:opacity-100">
                  <Plus className="h-3 w-3" />
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
  )
}
