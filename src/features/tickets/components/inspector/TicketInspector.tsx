'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/trpc'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Clock, PanelRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTicket } from '../../hooks/useTicket'
import { useTicketMutations } from '../../hooks/useTicketMutations'
import { useTicketInspectorStore } from '../../stores/useTicketInspectorStore'
import type { Ticket } from '../../types/ticket'

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

  // Ticketデータ取得
  const { data: ticketData, isLoading } = useTicket(ticketId!, { enabled: !!ticketId })
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

  const goToPrevious = () => {
    if (hasPrevious) {
      openInspector(allTickets[currentIndex - 1]!.id)
    }
  }

  const goToNext = () => {
    if (hasNext) {
      openInspector(allTickets[currentIndex + 1]!.id)
    }
  }

  // Mutations（Toast通知・キャッシュ無効化込み）
  const { updateTicket } = useTicketMutations()

  // デバウンスタイマー
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ローカル状態（UI用）
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

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
      } else if (field === 'priority' && value) {
        updateData.priority = value as 'urgent' | 'high' | 'normal' | 'low'
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
      <SheetContent className="w-[400px] gap-0 overflow-y-auto sm:w-[540px]" showCloseButton={false}>
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
            <div className="flex h-10 items-center gap-1 pt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => closeInspector()}
                aria-label="閉じる"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
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
              </div>
            </div>

            {/* タブ構成 */}
            <Tabs defaultValue="details">
              <TabsList className="border-border grid h-10 w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  詳細
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  セッション
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  アクティビティ
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  コメント
                </TabsTrigger>
              </TabsList>

              {/* 詳細タブ */}
              <TabsContent value="details" className="flex flex-col gap-4">
                {/* タイトル */}
                <div className="px-6 pt-2">
                  <Input
                    id="title"
                    defaultValue={ticket.title}
                    onChange={(e) => autoSave('title', e.target.value)}
                    className="bg-card dark:bg-card border-0 px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
                    placeholder="Add a title"
                  />
                </div>

                {/* 説明 */}
                <div className="px-6 pb-2">
                  <Textarea
                    id="description"
                    key={ticket.id}
                    defaultValue={ticket.description || ''}
                    onChange={(e) => autoSave('description', e.target.value)}
                    className="text-muted-foreground bg-card dark:bg-card min-h-[60px] resize-none border-0 px-0 text-sm shadow-none focus-visible:ring-0"
                    placeholder="Add description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">優先度</Label>
                    <select
                      id="priority"
                      key={`priority-${ticket.id}`}
                      defaultValue={ticket.priority || 'normal'}
                      onChange={(e) => autoSave('priority', e.target.value)}
                      className="bg-background border-input ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <option value="low">低</option>
                      <option value="normal">中</option>
                      <option value="high">高</option>
                      <option value="urgent">緊急</option>
                    </select>
                  </div>

                  <div className="space-y-2">
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

                {/* 日付・時間（作成ページと同じUI） */}
                <div className="relative pt-4">
                  <div className="flex items-center gap-3">
                    {/* 日付選択ボタン */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-auto px-2"
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <span className="text-sm">{selectedDate ? format(selectedDate, 'yyyy/MM/dd') : '日付'}</span>
                    </Button>

                    {/* 開始時間 - Selectドロップダウン */}
                    <Select value={startTime} onValueChange={handleStartTimeChange}>
                      <SelectTrigger className="w-auto [&_svg]:hidden">
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
                      <SelectTrigger className="w-auto [&_svg]:hidden">
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

                  {/* カレンダー展開 - 絶対配置 */}
                  {showCalendar && (
                    <div className="border-input bg-popover absolute top-12 left-0 z-50 rounded-md border shadow-md">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          handleDateChange(date)
                          setShowCalendar(false)
                        }}
                        classNames={{
                          month_caption: 'hidden',
                          nav: 'hidden',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* メタデータ */}
                {'id' in ticket && (
                  <div className="text-muted-foreground space-y-2 pt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>作成: {new Date(ticket.created_at || '').toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>更新: {new Date(ticket.updated_at || '').toLocaleString('ja-JP')}</span>
                    </div>
                    {ticket.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>期限: {new Date(ticket.due_date).toLocaleDateString('ja-JP')}</span>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* その他のタブ（将来実装） */}
              <TabsContent value="sessions">
                <div className="text-muted-foreground py-8 text-center">セッション機能は準備中です</div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="text-muted-foreground py-8 text-center">アクティビティログは準備中です</div>
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
