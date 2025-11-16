'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useInboxFocusStore } from '@/features/inbox/stores/useInboxFocusStore'
import { api } from '@/lib/trpc'
import { format } from 'date-fns'
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  ExternalLink,
  FileText,
  Link,
  MoreHorizontal,
  PanelRight,
  Plus,
  Save,
  Tag,
  Trash,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTicket } from '../../hooks/useTicket'
import { useTicketActivities } from '../../hooks/useTicketActivities'
import { useTicketMutations } from '../../hooks/useTicketMutations'
import { useTicketTags } from '../../hooks/useTicketTags'
import { useTicketInspectorStore } from '../../stores/useTicketInspectorStore'
import type { Ticket } from '../../types/ticket'
import { formatActivity, formatRelativeTime } from '../../utils/activityFormatter'
import { DatePickerPopover } from '../shared/DatePickerPopover'
import { RecurrencePopover } from '../shared/RecurrencePopover'
import { ReminderPopover } from '../shared/ReminderPopover'
import { TicketTagsSection } from '../shared/TicketTagsSection'

// 15分刻みの時間オプションを生成（0:00 - 23:45）
const generateTimeOptions = () => {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push(timeString)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

/**
 * Ticket Inspector（全ページ共通Sheet）
 *
 * - Kanban、Calendar、Table等、全ビューから呼び出し可能
 * - useTicketInspectorStoreでグローバル状態管理
 * - レイアウトに配置して常にマウント
 * - 各フィールド変更時に自動保存（デバウンス処理あり）
 *
 * @example
 * ```tsx
 * // レイアウトに配置
 * <TicketInspector />
 *
 * // 各ビューから呼び出し
 * const { openInspector } = useTicketInspectorStore()
 * <div onClick={() => openInspector(ticket.id)}>...</div>
 * ```
 */
export function TicketInspector() {
  const { isOpen, ticketId, closeInspector, openInspector } = useTicketInspectorStore()
  const { setFocusedId } = useInboxFocusStore()

  // Ticketデータ取得（タグ情報も含む）
  const { data: ticketData, isLoading } = useTicket(ticketId!, { includeTags: true, enabled: !!ticketId })
  // Type assertion: In practice ticketData is Ticket | undefined (tRPC error handling is separate)
  const ticket = (ticketData ?? null) as Ticket | null

  // 全チケットリスト取得（ナビゲーション用）
  const { data: allTickets = [] } = api.tickets.list.useQuery()

  // 現在のチケットのインデックスを計算
  const currentIndex = useMemo(() => {
    return allTickets.findIndex((t) => t.id === ticketId)
  }, [allTickets, ticketId])

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < allTickets.length - 1

  // アクティビティの並び順状態
  const [activityOrder, setActivityOrder] = useState<'asc' | 'desc'>('desc')
  // ソートアイコンのホバー状態
  const [isHoveringSort, setIsHoveringSort] = useState(false)
  // 選択されたタグのID配列
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const { addTicketTag, removeTicketTag } = useTicketTags()

  // チケットのタグ情報を selectedTagIds に反映
  useEffect(() => {
    if (ticketData && 'tags' in ticketData) {
      const tagIds = (ticketData.tags as Array<{ id: string }>).map((tag) => tag.id)
      setSelectedTagIds(tagIds)
    } else {
      setSelectedTagIds([])
    }
  }, [ticketData])

  // Description欄の初期高さ設定
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (descriptionRef.current && ticket) {
      const textarea = descriptionRef.current
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 96) // 96px = 6rem (4行分)
      textarea.style.height = `${newHeight}px`
    }
  }, [ticket?.id, ticket?.description])

  // Inspectorの幅管理
  const [inspectorWidth, setInspectorWidth] = useState(540)
  const [isResizing, setIsResizing] = useState(false)

  // タグ変更ハンドラー（追加の差分を検出して実行）
  const handleTagsChange = async (newTagIds: string[]) => {
    if (!ticketId) return

    const oldTagIds = selectedTagIds
    const added = newTagIds.filter((id) => !oldTagIds.includes(id))

    // 楽観的更新
    setSelectedTagIds(newTagIds)

    try {
      // 追加されたタグを保存
      for (const tagId of added) {
        await addTicketTag(ticketId, tagId)
      }
    } catch (error) {
      console.error('Failed to add tags:', error)
      // エラー時は元に戻す
      setSelectedTagIds(oldTagIds)
    }
  }

  // タグ削除ハンドラー
  const handleRemoveTag = async (tagId: string) => {
    if (!ticketId) return

    // 楽観的更新
    const oldTagIds = selectedTagIds
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))

    try {
      await removeTicketTag(ticketId, tagId)
    } catch (error) {
      console.error('Failed to remove tag:', error)
      // エラー時は元に戻す
      setSelectedTagIds(oldTagIds)
    }
  }

  // リサイズハンドラー
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      // 最小400px、最大800px
      if (newWidth >= 400 && newWidth <= 800) {
        setInspectorWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const goToPrevious = () => {
    if (hasPrevious) {
      const prevTicketId = allTickets[currentIndex - 1]!.id
      openInspector(prevTicketId)
      setFocusedId(prevTicketId)
    }
  }

  const goToNext = () => {
    if (hasNext) {
      const nextTicketId = allTickets[currentIndex + 1]!.id
      openInspector(nextTicketId)
      setFocusedId(nextTicketId)
    }
  }

  // Mutations（Toast通知・キャッシュ無効化込み）
  const { updateTicket, deleteTicket } = useTicketMutations()

  // 削除ハンドラー
  const handleDelete = () => {
    if (!ticketId) return
    if (confirm('このチケットを削除しますか？')) {
      deleteTicket.mutate({ id: ticketId })
      closeInspector()
    }
  }

  // IDコピー
  const handleCopyId = () => {
    if (!ticketId) return
    navigator.clipboard.writeText(ticketId)
  }

  // 新しいタブで開く
  const handleOpenInNewTab = () => {
    if (!ticketId) return
    window.open(`/tickets/${ticketId}`, '_blank')
  }

  // 複製
  const handleDuplicate = () => {
    if (!ticket) return
    // TODO: 複製ロジックを実装
    console.log('Duplicate ticket:', ticket)
  }

  // リンクをコピー
  const handleCopyLink = () => {
    if (!ticketId) return
    const url = `${window.location.origin}/tickets/${ticketId}`
    navigator.clipboard.writeText(url)
  }

  // テンプレートとして保存
  const handleSaveAsTemplate = () => {
    if (!ticket) return
    // TODO: テンプレート保存ロジックを実装
    console.log('Save as template:', ticket)
  }

  // デバウンスタイマー
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ローカル状態（UI用）
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [repeatType, setRepeatType] = useState<string>('')
  const [reminderType, setReminderType] = useState<string>('')

  // Ticketデータが読み込まれたら状態を初期化
  useEffect(() => {
    if (ticket && 'id' in ticket) {
      if (ticket.due_date) {
        setSelectedDate(new Date(ticket.due_date))
      } else {
        setSelectedDate(undefined)
      }

      if (ticket.start_time) {
        const date = new Date(ticket.start_time)
        setStartTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setStartTime('')
      }

      if (ticket.end_time) {
        const date = new Date(ticket.end_time)
        setEndTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`)
      } else {
        setEndTime('')
      }
    }
  }, [ticket])

  // 経過時間を計算（00:00形式）
  const elapsedTime = useMemo(() => {
    if (!startTime || !endTime) return null

    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (endMinutes <= startMinutes) return null

    const diff = endMinutes - startMinutes
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [startTime, endTime])

  // 自動保存関数（デバウンス処理付き）
  const autoSave = (field: string, value: string | undefined) => {
    if (!ticketId) return

    // 既存のタイマーをクリア
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 新しいタイマーを設定（500ms後に保存）
    debounceTimerRef.current = setTimeout(() => {
      const updateData: Record<string, string | undefined> = {}

      // フィールドに応じて適切な型で設定
      if (field === 'status' && value) {
        updateData.status = value as 'open' | 'in_progress' | 'completed' | 'cancelled'
      } else {
        updateData[field] = value
      }

      updateTicket.mutate({
        id: ticketId,
        data: updateData,
      })
    }, 500)
  }

  // 日付変更時の保存
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      autoSave('due_date', format(date, 'yyyy-MM-dd'))
    } else {
      autoSave('due_date', undefined)
    }
  }

  // 開始時間変更時の保存
  const handleStartTimeChange = (time: string) => {
    setStartTime(time)
    if (time && selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours, minutes, 0, 0)
      autoSave('start_time', dateTime.toISOString())
    } else {
      autoSave('start_time', undefined)
    }
  }

  // 終了時間変更時の保存
  const handleEndTimeChange = (time: string) => {
    setEndTime(time)
    if (time && selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours, minutes, 0, 0)
      autoSave('end_time', dateTime.toISOString())
    } else {
      autoSave('end_time', undefined)
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Early return if no ticket
  if (!isOpen) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeInspector()} modal={false}>
      <SheetContent className="gap-0 overflow-y-auto" style={{ width: `${inspectorWidth}px` }} showCloseButton={false}>
        {/* リサイズハンドル */}
        <div
          onMouseDown={handleMouseDown}
          className={`hover:bg-primary/50 absolute top-0 left-0 h-full w-1 cursor-ew-resize ${
            isResizing ? 'bg-primary' : ''
          }`}
          style={{ touchAction: 'none' }}
        />
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
          </div>
        ) : !ticket ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">チケットが見つかりません</p>
          </div>
        ) : (
          <>
            {/* ヘッダー */}
            <div className="flex h-10 items-center justify-between pt-2">
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => closeInspector()}
                        aria-label="閉じる"
                      >
                        <PanelRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>閉じる</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={goToPrevious}
                          disabled={!hasPrevious}
                          aria-label="前のチケット"
                        >
                          <ChevronUp className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>前のチケット</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={goToNext}
                          disabled={!hasNext}
                          aria-label="次のチケット"
                        >
                          <ChevronDown className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>次のチケット</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TooltipProvider>

              {/* オプションメニュー */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-0" aria-label="オプション">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    複製する
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link className="mr-2 h-4 w-4" />
                    リンクをコピー
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAsTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    テンプレートとして保存
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyId}>
                    <Copy className="mr-2 h-4 w-4" />
                    IDをコピー
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenInNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    新しいタブで開く
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* タブ構成 */}
            <Tabs defaultValue="details" className="pt-2">
              <TabsList className="border-border grid h-10 w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  詳細
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <span className="relative flex items-center gap-1.5">
                    アクティビティ
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActivityOrder(activityOrder === 'desc' ? 'asc' : 'desc')
                      }}
                      onMouseEnter={() => setIsHoveringSort(true)}
                      onMouseLeave={() => setIsHoveringSort(false)}
                      className="hover:bg-accent rounded p-0.5 transition-colors"
                      aria-label={activityOrder === 'desc' ? '古い順に変更' : '最新順に変更'}
                    >
                      {activityOrder === 'desc' ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {isHoveringSort && (
                      <div className="bg-foreground text-background absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
                        {activityOrder === 'desc' ? '最新順で表示中' : '古い順で表示中'}
                      </div>
                    )}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  コメント
                </TabsTrigger>
              </TabsList>

              {/* 詳細タブ */}
              <TabsContent value="details">
                {/* タイトル */}
                <div className="px-6 pt-4 pb-2">
                  <div className="flex items-baseline gap-2">
                    <div className="min-w-0 flex-1">
                      <Input
                        id="title"
                        defaultValue={ticket.title}
                        onChange={(e) => autoSave('title', e.target.value)}
                        className="bg-card dark:bg-card border-0 px-0 text-[2rem] font-bold shadow-none focus-visible:ring-0"
                        placeholder="Add a title"
                        style={{ fontSize: 'var(--font-size-xl)' }}
                      />
                    </div>
                    {ticket.ticket_number && (
                      <span
                        className="text-muted-foreground shrink-0 text-[2rem]"
                        style={{ fontSize: 'var(--font-size-xl)' }}
                      >
                        #{ticket.ticket_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* 日付・時間 */}
                <div className="border-border/50 border-t px-6 pt-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />

                    <DatePickerPopover selectedDate={selectedDate} onDateChange={handleDateChange} />

                    {/* 開始時間 - Selectドロップダウン */}
                    <Select value={startTime} onValueChange={handleStartTimeChange}>
                      <SelectTrigger className="w-auto !border-0 !bg-transparent !shadow-none hover:!bg-transparent focus:!ring-0 [&_svg]:hidden">
                        <SelectValue placeholder="開始" />
                      </SelectTrigger>
                      <SelectContent side="bottom" align="start" className="max-h-[240px] overflow-y-auto">
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={`start-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">→</span>

                    {/* 終了時間 - Selectドロップダウン */}
                    <Select value={endTime} onValueChange={handleEndTimeChange} disabled={!startTime}>
                      <SelectTrigger className="w-auto !border-0 !bg-transparent !shadow-none hover:!bg-transparent focus:!ring-0 [&_svg]:hidden">
                        <SelectValue placeholder="終了" />
                      </SelectTrigger>
                      <SelectContent side="bottom" align="start" className="max-h-[240px] overflow-y-auto">
                        {TIME_OPTIONS.map((time) => {
                          if (!startTime) return null

                          // 各終了時刻に対する経過時間を計算
                          const [startHour, startMin] = startTime.split(':').map(Number)
                          const [endHour, endMin] = time.split(':').map(Number)
                          const startMinutes = startHour * 60 + startMin
                          const endMinutes = endHour * 60 + endMin

                          // 開始時刻以前の時刻は表示しない
                          if (endMinutes <= startMinutes) return null

                          return (
                            <SelectItem key={`end-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>

                    {/* 総経過時間を表示 */}
                    {elapsedTime && <span className="text-muted-foreground text-sm">{elapsedTime}</span>}
                  </div>
                </div>

                {/* リピートと通知 */}
                <div className="flex items-center gap-4 px-6 pb-3">
                  <div className="ml-6 flex items-center gap-4">
                    <RecurrencePopover repeatType={repeatType} onRepeatTypeChange={setRepeatType} />
                    <ReminderPopover reminderType={reminderType} onReminderTypeChange={setReminderType} />
                  </div>
                </div>

                {/* Tags */}
                <TicketTagsSection
                  selectedTagIds={selectedTagIds}
                  onTagsChange={handleTagsChange}
                  onRemoveTag={handleRemoveTag}
                  showBorderTop={true}
                  popoverAlign="end"
                  popoverSide="bottom"
                  popoverAlignOffset={-80}
                />

                {/* 説明 */}
                <div className="border-border/50 border-t px-6 py-2">
                  <div className="flex gap-2">
                    <FileText className="text-muted-foreground mt-[0.5rem] h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Textarea
                        ref={descriptionRef}
                        id="description"
                        key={ticket.id}
                        defaultValue={ticket.description || ''}
                        onChange={(e) => autoSave('description', e.target.value)}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement
                          target.style.height = 'auto'
                          const newHeight = Math.min(target.scrollHeight, 96) // 96px = 6rem (4行分)
                          target.style.height = `${newHeight}px`
                        }}
                        className="text-muted-foreground bg-card dark:bg-card max-h-[6rem] min-h-[1.5rem] resize-none border-0 px-0 text-sm shadow-none focus-visible:ring-0"
                        placeholder="Add description..."
                        style={{
                          scrollbarColor: 'var(--color-muted-foreground) var(--color-card)',
                          height: 'auto',
                          overflowY: 'auto',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ステータス */}
                <div className="flex flex-col gap-4 px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="status">ステータス</Label>
                    <select
                      id="status"
                      key={`status-${ticket.id}`}
                      defaultValue={ticket.status}
                      onChange={(e) => autoSave('status', e.target.value)}
                      className="bg-background border-input ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              {/* アクティビティタブ */}
              <TabsContent value="activity">
                <ActivityTab ticketId={ticketId!} order={activityOrder} onOrderChange={setActivityOrder} />
              </TabsContent>

              <TabsContent value="comments">
                <div className="text-muted-foreground py-8 text-center">コメント機能は準備中です</div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/**
 * アクティビティタブコンポーネント
 */
function ActivityTab({
  ticketId,
  order,
  onOrderChange,
}: {
  ticketId: string
  order: 'asc' | 'desc'
  onOrderChange: (order: 'asc' | 'desc') => void
}) {
  const { data: activities, isLoading } = useTicketActivities(ticketId, { order })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2" />
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">まだアクティビティがありません</div>
  }

  return (
    <div>
      {/* アクティビティリスト */}
      <div className="px-6 py-4">
        {activities.map((activity, index) => {
          const formatted = formatActivity(activity)
          const IconComponent = getActivityIcon(formatted.icon)
          const isLast = index === activities.length - 1

          return (
            <div key={activity.id} className="flex gap-3">
              {/* タイムラインライン + アイコン */}
              <div className="relative flex flex-col items-center">
                {/* アイコン */}
                <div className="bg-muted relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <IconComponent className="h-4 w-4" />
                </div>

                {/* 縦線（最後のアイテム以外） */}
                {!isLast && <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />}
              </div>

              {/* 内容 */}
              <div className="flex-1 space-y-1 pb-6">
                <p className="text-sm">{formatted.message}</p>
                <p className="text-muted-foreground text-xs">{formatRelativeTime(activity.created_at)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * アクティビティアイコン取得
 */
function getActivityIcon(icon: 'create' | 'update' | 'status' | 'tag' | 'delete') {
  switch (icon) {
    case 'create':
      return Plus
    case 'update':
      return Edit
    case 'status':
      return CheckCircle
    case 'tag':
      return Tag
    case 'delete':
      return Trash
    default:
      return Edit
  }
}
