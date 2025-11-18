'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import type { InboxItem } from '@/features/inbox/hooks/useInboxData'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar as CalendarIcon, Check, MoreVertical, Plus, Tag } from 'lucide-react'
import { useState } from 'react'
import { useBoardStatusFilterStore } from '../stores/useBoardStatusFilterStore'
import { TicketCard } from './shared/TicketCard'

interface TicketKanbanBoardProps {
  items: InboxItem[]
}

/**
 * Ticket/Session用Kanbanボード
 *
 * InboxItemをステータスごとに3カラムに分類して表示
 */
export function TicketKanbanBoard({ items }: TicketKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { updateTicket } = useTicketMutations()
  const { isStatusVisible } = useBoardStatusFilterStore()

  // Ticketデータをカラムごとに分類
  const columns = {
    backlog: items.filter((item) => item.status === 'backlog'),
    ready: items.filter((item) => item.status === 'ready'),
    active: items.filter((item) => item.status === 'active'),
    wait: items.filter((item) => item.status === 'wait'),
    done: items.filter((item) => item.status === 'done'),
    cancel: items.filter((item) => item.status === 'cancel'),
  }

  // ドラッグ中のカードを取得
  const activeItem = activeId ? items.find((item) => item.id === activeId) : null

  // ドラッグセンサー設定（ポインターでドラッグ）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始
      },
    })
  )

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // ドラッグ終了
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    // ドロップ先のカラムステータスを取得
    const targetStatus = over.id as TicketStatus

    // ドラッグ中のアイテムを取得
    const draggedItem = items.find((item) => item.id === active.id)

    if (draggedItem && draggedItem.status !== targetStatus) {
      // ステータスを更新
      updateTicket.mutate({
        id: draggedItem.id,
        data: {
          status: targetStatus,
        },
      })
    }

    setActiveId(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {/* Backlog カラム */}
        {isStatusVisible('backlog') && (
          <KanbanColumn title="Backlog" count={columns.backlog.length} variant="default" status="backlog">
            {columns.backlog.map((item) => (
              <TicketCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Ready カラム */}
        {isStatusVisible('ready') && (
          <KanbanColumn title="Ready" count={columns.ready.length} variant="ready" status="ready">
            {columns.ready.map((item) => (
              <TicketCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Active カラム */}
        {isStatusVisible('active') && (
          <KanbanColumn title="Active" count={columns.active.length} variant="active" status="active">
            {columns.active.map((item) => (
              <TicketCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Wait カラム */}
        {isStatusVisible('wait') && (
          <KanbanColumn title="Wait" count={columns.wait.length} variant="wait" status="wait">
            {columns.wait.map((item) => (
              <TicketCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Done カラム */}
        {isStatusVisible('done') && (
          <KanbanColumn title="Done" count={columns.done.length} variant="done" status="done">
            {columns.done.map((item) => (
              <TicketCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}

        {/* Cancel カラム */}
        {isStatusVisible('cancel') && (
          <KanbanColumn title="Cancel" count={columns.cancel.length} variant="cancel" status="cancel">
            {columns.cancel.map((item) => (
              <TicketCard key={item.id} item={item} />
            ))}
          </KanbanColumn>
        )}
      </div>

      {/* ドラッグ中のカードプレビュー */}
      <DragOverlay>
        {activeItem ? (
          <div className="bg-card border-primary rotate-3 cursor-grabbing rounded-lg border-2 p-3 opacity-90 shadow-2xl">
            {/* 1. タイトル */}
            <div className="flex items-center gap-2 overflow-hidden">
              <h3 className="text-foreground min-w-0 text-base leading-tight font-semibold">{activeItem.title}</h3>
              {activeItem.ticket_number && (
                <span className="text-muted-foreground shrink-0 text-sm">#{activeItem.ticket_number}</span>
              )}
            </div>

            {/* 2. 日付・時間 */}
            {(activeItem.due_date || activeItem.start_time || activeItem.end_time) && (
              <div className="text-foreground mt-2 flex w-fit items-center gap-1 text-sm">
                {activeItem.due_date && (
                  <span>{format(new Date(activeItem.due_date), 'yyyy/MM/dd', { locale: ja })}</span>
                )}
                {activeItem.start_time && activeItem.end_time && (
                  <span>
                    {' '}
                    {format(new Date(activeItem.start_time), 'HH:mm')} →{' '}
                    {format(new Date(activeItem.end_time), 'HH:mm')}
                  </span>
                )}
              </div>
            )}

            {/* 3. Tags */}
            {activeItem.tags && activeItem.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {activeItem.tags.slice(0, 4).map((tag) => (
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
                {activeItem.tags.length > 4 && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    +{activeItem.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
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

  // ドロップ可能エリアの設定
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  // タグ一覧を取得（TODO: tagsテーブルのパーミッション設定後に有効化）
  const allTags: never[] = []

  // タグ検索結果をフィルタリング
  const filteredTags = allTags.filter((tag: { name: string }) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  const bgColor = {
    default: 'bg-gray-100 dark:bg-gray-800/40',
    ready: 'bg-blue-100 dark:bg-blue-900/30',
    active: 'bg-purple-100 dark:bg-purple-900/30',
    wait: 'bg-orange-100 dark:bg-orange-900/30',
    done: 'bg-green-100 dark:bg-green-900/30',
    cancel: 'bg-red-100 dark:bg-red-900/30',
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
    <div ref={setNodeRef} className={cn('flex min-w-[300px] flex-col rounded-lg', isOver && 'ring-primary/30 ring-2')}>
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
                <MiniCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
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
