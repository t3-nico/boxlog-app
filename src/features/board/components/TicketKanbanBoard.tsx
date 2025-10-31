'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { InboxItem } from '@/features/inbox/hooks/useInboxData'
import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Check, MoreVertical, Plus, Tag } from 'lucide-react'
import { useState } from 'react'

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
      <div className={`${bgColor} flex items-center justify-between rounded-t-lg p-4`}>
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
      <div className={`${bgColor} flex-1 space-y-2 overflow-y-auto rounded-b-lg p-4`}>
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
  const isActive = ticketId === item.id

  // 時間フォーマット関数
  const formatDateTime = () => {
    if (!item.due_date && !item.start_time && !item.end_time) return null

    const parts: string[] = []

    // 日付
    if (item.due_date) {
      const date = new Date(item.due_date)
      parts.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }))
    }

    // 時間範囲
    if (item.start_time && item.end_time) {
      const start = new Date(item.start_time)
      const end = new Date(item.end_time)
      parts.push(
        `${start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
      )
    } else if (item.start_time) {
      const start = new Date(item.start_time)
      parts.push(start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }))
    }

    return parts.join(' ')
  }

  const timeDisplay = formatDateTime()

  const handleClick = () => {
    if (item.type === 'ticket') {
      openInspector(item.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-card hover:bg-accent border-border group flex cursor-pointer flex-col gap-2 rounded-lg border p-3 shadow-sm transition-all hover:shadow-md ${
        isActive ? 'border-primary' : ''
      }`}
    >
      {/* 1. タイトル */}
      <div>
        <h3 className="text-foreground text-sm leading-tight font-medium">{item.title}</h3>
      </div>

      {/* 2. 時間 */}
      {timeDisplay && (
        <div className="text-muted-foreground flex items-center text-xs">
          <span>{timeDisplay}</span>
        </div>
      )}

      {/* 3. Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className={cn(
                tag.color && `border-[${tag.color}] bg-[${tag.color}]/10 text-[${tag.color}] dark:bg-[${tag.color}]/20`
              )}
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
          {item.tags.length > 3 && (
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
