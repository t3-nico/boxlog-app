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
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Check, Flag, MoreVertical, Plus, Tag } from 'lucide-react'
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
      <KanbanColumn title="Backlog" subtitle="準備中" count={columns.backlog.length} variant="default" status="backlog">
        {columns.backlog.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Ready カラム */}
      <KanbanColumn title="Ready" subtitle="配置済み" count={columns.ready.length} variant="default" status="ready">
        {columns.ready.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Active カラム */}
      <KanbanColumn title="Active" subtitle="作業中" count={columns.active.length} variant="progress" status="active">
        {columns.active.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Wait カラム */}
      <KanbanColumn title="Wait" subtitle="待ち" count={columns.wait.length} variant="default" status="wait">
        {columns.wait.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Done カラム */}
      <KanbanColumn title="Done" subtitle="完了" count={columns.done.length} variant="done" status="done">
        {columns.done.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Cancel カラム */}
      <KanbanColumn title="Cancel" subtitle="中止" count={columns.cancel.length} variant="default" status="cancel">
        {columns.cancel.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>
    </div>
  )
}

interface KanbanColumnProps {
  title: string
  subtitle: string
  count: number
  variant: 'default' | 'progress' | 'done'
  status: 'backlog' | 'ready' | 'active' | 'wait' | 'done' | 'cancel'
  children: React.ReactNode
}

function KanbanColumn({ title, subtitle, count, variant, status, children }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal' | 'low'>('normal')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [showPriority, setShowPriority] = useState(false)
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
    progress: 'bg-blue-50 dark:bg-blue-950/20',
    done: 'bg-green-50 dark:bg-green-950/20',
  }[variant]

  const handleCreate = () => {
    if (!newTitle.trim()) return

    createTicket.mutate({
      title: newTitle,
      status,
      priority,
      due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    })

    // リセット
    setNewTitle('')
    setPriority('normal')
    setSelectedDate(undefined)
    setSelectedTagIds([])
    setTagSearchQuery('')
    setShowPriority(false)
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
      setPriority('normal')
      setSelectedDate(undefined)
      setSelectedTagIds([])
      setTagSearchQuery('')
      setShowPriority(false)
      setShowCalendar(false)
      setShowTags(false)
    }
  }

  return (
    <div className="flex min-w-[300px] flex-col rounded-lg">
      <div className={`${bgColor} flex items-center justify-between rounded-t-lg p-4`}>
        <div className="flex flex-col">
          <h3 className="text-foreground font-semibold">
            {title} <span className="text-muted-foreground">({count})</span>
          </h3>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            {/* ドロップダウンメニュー */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>その他のオプション</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>すべて完了にする</DropdownMenuItem>
                <DropdownMenuItem>すべてアーカイブ</DropdownMenuItem>
                <DropdownMenuItem>カラムをクリア</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* プラスアイコン */}
            <Tooltip>
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
              <TooltipContent side="bottom">
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

              {/* 優先度アイコン */}
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                type="button"
                title="優先度を設定"
                onClick={() => setShowPriority(!showPriority)}
              >
                <Flag className="h-3.5 w-3.5" />
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

            {/* 優先度選択ポップアップ */}
            {showPriority && (
              <div className="border-input bg-popover absolute top-full left-0 z-50 mt-1 w-40 rounded-md border shadow-md">
                <div className="p-1">
                  <button
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                    onClick={() => {
                      setPriority('urgent')
                      setShowPriority(false)
                    }}
                    type="button"
                  >
                    <span className="text-red-500">🔴</span>
                    <span>緊急</span>
                  </button>
                  <button
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                    onClick={() => {
                      setPriority('high')
                      setShowPriority(false)
                    }}
                    type="button"
                  >
                    <span className="text-orange-500">🟠</span>
                    <span>高</span>
                  </button>
                  <button
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                    onClick={() => {
                      setPriority('normal')
                      setShowPriority(false)
                    }}
                    type="button"
                  >
                    <span className="text-gray-500">⚪</span>
                    <span>中</span>
                  </button>
                  <button
                    className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                    onClick={() => {
                      setPriority('low')
                      setShowPriority(false)
                    }}
                    type="button"
                  >
                    <span className="text-gray-400">⚫</span>
                    <span>低</span>
                  </button>
                </div>
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
  const { openInspector } = useTicketInspectorStore()

  const priorityStyles: Record<string, string> = {
    high: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }

  const priorityClass = item.priority ? priorityStyles[item.priority] || priorityStyles.low : ''

  const handleClick = () => {
    if (item.type === 'ticket') {
      openInspector(item.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="bg-card hover:bg-accent border-border group cursor-pointer rounded-lg border p-3 shadow-sm transition-all hover:shadow-md"
    >
      <div className="text-foreground mb-1 text-sm font-medium">{item.title}</div>
      <div className="text-muted-foreground mb-2 text-xs">
        {item.type === 'ticket' && item.ticket_number ? `#${item.ticket_number}` : item.type}
      </div>
      {item.priority && (
        <span className={`inline-block rounded px-2 py-1 text-xs ${priorityClass}`}>{item.priority}</span>
      )}
    </div>
  )
}
