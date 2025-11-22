'use client'

import React, { useCallback, useState } from 'react'

import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { toast } from 'sonner'

import { useTicketMutations } from '@/features/plans/hooks/useTicketMutations'
import { useTickets } from '@/features/plans/hooks/useTickets'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'

interface DnDProviderProps {
  children: React.ReactNode
}

/**
 * DnDProvider - dnd-kit を使用したドラッグ・アンド・ドロップコンテキスト
 *
 * **変更履歴**:
 * - react-dnd から @dnd-kit/core に移行（TicketKanbanBoardとの統一のため）
 * - onDragEnd ハンドラーを追加（Calendarへのドロップ対応）
 *
 * **機能**:
 * - TicketCard（Sidebar）からCalendar グリッドへのドラッグが可能
 * - PointerSensor: 8px移動したらドラッグ開始（誤動作防止）
 * - ドロップ位置から日付・時刻を計算してTicket更新
 *
 * **エッジケース対応**:
 * - 終日イベント（時間なし）→ due_date のみ更新
 * - 時間指定イベント → due_date + start_time + end_time を更新
 * - 無効なドロップ先 → エラーメッセージ表示
 * - 重複イベント → 既存の時間幅を保持
 */
export const DnDProvider = ({ children }: DnDProviderProps) => {
  const { updateTicket } = useTicketMutations()
  const { timezone } = useCalendarSettingsStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragPreviewTime, setDragPreviewTime] = useState<{ date: string; time?: string } | null>(null)

  // ドラッグ中のTicket情報を取得（リアルタイム性最適化済み）
  const { data: tickets } = useTickets()
  const activeTicket = tickets?.find((t) => t.id === activeId)

  // ドラッグセンサー設定（ポインターでドラッグ）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始
      },
    })
  )

  /**
   * ドラッグ開始時の処理
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setDragPreviewTime(null) // リセット
  }, [])

  /**
   * ドラッグ移動中の処理（時間表示をリアルタイム更新）
   */
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { over } = event

    if (!over) {
      setDragPreviewTime(null)
      return
    }

    // ドロップ先のデータを取得
    const dropData = over.data?.current
    if (!dropData || !dropData.date) {
      setDragPreviewTime(null)
      return
    }

    // 日付を文字列に変換
    let dateStr: string
    if (dropData.date instanceof Date) {
      const year = dropData.date.getFullYear()
      const month = String(dropData.date.getMonth() + 1).padStart(2, '0')
      const day = String(dropData.date.getDate()).padStart(2, '0')
      dateStr = `${year}-${month}-${day}`
    } else {
      dateStr = dropData.date
    }

    // プレビュー時間を更新
    setDragPreviewTime({
      date: dateStr,
      time: dropData.time, // 'HH:mm' または undefined
    })
  }, [])

  /**
   * Ticketドロップの共通処理
   */
  const handleTicketDrop = useCallback(
    (ticketId: string, over: any) => {
      // ドロップ先のデータ
      const dropData = over.data?.current
      if (!dropData || !dropData.date) {
        console.warn('[DnDProvider] ドロップ先データが不正:', dropData)
        toast.error('ドロップ先が無効です')
        setActiveId(null)
        return
      }

      console.log('[DnDProvider] ドラッグ終了:', {
        ticketId,
        dropData,
      })

      try {
        // 1. 日付を取得（Date型 または YYYY-MM-DD文字列）
        let due_date: string
        if (dropData.date instanceof Date) {
          // Date型の場合、ローカルタイムゾーンで年月日を取得
          const year = dropData.date.getFullYear()
          const month = String(dropData.date.getMonth() + 1).padStart(2, '0')
          const day = String(dropData.date.getDate()).padStart(2, '0')
          due_date = `${year}-${month}-${day}`
        } else if (typeof dropData.date === 'string') {
          // 文字列の場合、そのまま使用
          due_date = dropData.date
        } else {
          throw new Error('日付形式が不正です')
        }

        console.log('[DnDProvider] ドロップ先日付:', {
          originalDate: dropData.date,
          parsedDueDate: due_date,
        })

        // 3. 時刻を取得
        let start_time: string | null = null
        let end_time: string | null = null

        if (dropData.time) {
          // 時間指定あり（例: "14:30"）
          const timeMatch = dropData.time.match(/^(\d{1,2}):(\d{2})$/)
          if (!timeMatch) {
            throw new Error('時刻形式が不正です')
          }

          const [, hourStr, minuteStr] = timeMatch
          const hour = parseInt(hourStr, 10)
          const minute = parseInt(minuteStr, 10)

          // 時刻の妥当性チェック
          if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new Error('時刻が範囲外です')
          }

          // ユーザーのタイムゾーンでDateオブジェクトを作成
          const [year, month, day] = due_date.split('-').map(Number)
          // ユーザーのタイムゾーンの時刻として作成
          const zonedStart = new Date(year, month - 1, day, hour, minute, 0)
          const zonedEnd = new Date(year, month - 1, day, hour + 1, minute, 0)

          // ユーザーのタイムゾーンの時刻をUTCに変換
          const startDate = fromZonedTime(zonedStart, timezone)
          const endDate = fromZonedTime(zonedEnd, timezone)

          // ISO 8601形式（UTC）に変換
          start_time = startDate.toISOString()
          end_time = endDate.toISOString()

          console.log('[DnDProvider] 時間指定イベント:', {
            due_date,
            dropTime: dropData.time,
            timezone,
            zonedStart: zonedStart.toLocaleString('ja-JP'),
            zonedEnd: zonedEnd.toLocaleString('ja-JP'),
            start_time,
            end_time,
          })
        } else {
          // 時間指定なし（終日イベント）
          start_time = null
          end_time = null

          console.log('[DnDProvider] 終日イベント:', {
            due_date,
          })
        }

        // 4. Ticket更新
        // 注意: optional()フィールドでは undefined = 更新しない、null = NULL値に更新
        const updateData: {
          due_date: string
          start_time: string | null
          end_time: string | null
        } = {
          due_date,
          start_time,
          end_time,
        }

        console.log('[DnDProvider] updateTicket.mutate 呼び出し:', {
          id: ticketId,
          data: updateData,
        })

        updateTicket.mutate({
          id: ticketId,
          data: updateData,
        })
      } catch (error) {
        console.error('[DnDProvider] ドロップ処理エラー:', error)
        toast.error(error instanceof Error ? error.message : 'ドロップに失敗しました')
      } finally {
        // ドラッグ終了時にactiveIdをクリア
        setActiveId(null)
        setDragPreviewTime(null)
      }
    },
    [updateTicket]
  )

  /**
   * ドラッグ終了時の処理
   *
   * **ドロップ先データ形式**:
   * - over.data.current.date: Date | string (YYYY-MM-DD)
   * - over.data.current.time: string (HH:mm) | undefined
   *
   * **対応するドラッグタイプ**:
   * - Ticketカード（Sidebar等）
   * - カレンダーイベント（calendar-event）
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      // ドロップ先がない場合は何もしない
      if (!over) {
        console.log('[DnDProvider] ドロップ先なし')
        setActiveId(null)
        return
      }

      // ドラッグ元のデータを取得
      const dragData = active.data?.current
      const dragType = dragData?.type

      // カレンダーイベントの場合
      if (dragType === 'calendar-event') {
        const calendarEvent = dragData?.event
        if (!calendarEvent?.id) {
          console.warn('[DnDProvider] カレンダーイベントIDが取得できません')
          setActiveId(null)
          return
        }
        // Ticketとして扱う（CalendarEventはTicketベース）
        const ticketId = calendarEvent.id
        console.log('[DnDProvider] カレンダーイベントをドラッグ中:', ticketId)
        // 以降の処理でticketIdとして扱う
        handleTicketDrop(ticketId, over)
        return
      }

      // 通常のTicketカードの場合
      const ticketId = active.id as string
      handleTicketDrop(ticketId, over)
    },
    [handleTicketDrop]
  )

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      {children}

      {/* ドラッグ中のプレビュー */}
      <DragOverlay>
        {activeTicket ? (
          <div className="bg-card border-primary flex h-20 w-64 flex-col gap-1 rounded-lg border-2 p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-8 w-1 rounded-full" />
              <div className="text-foreground flex-1 text-sm font-semibold">{activeTicket.title}</div>
            </div>
            <div className="text-muted-foreground ml-3 space-y-0.5 text-xs">
              {/* ドラッグ中の時間をリアルタイム表示 */}
              {dragPreviewTime ? (
                <>
                  <div>📅 {format(new Date(dragPreviewTime.date + 'T00:00:00'), 'yyyy/MM/dd')}</div>
                  {dragPreviewTime.time && (
                    <div>
                      🕐 {dragPreviewTime.time} -{' '}
                      {(() => {
                        // 終了時間を計算（開始時刻 + 1時間）
                        const [hour, minute] = dragPreviewTime.time.split(':').map(Number)
                        const endHour = String(hour + 1).padStart(2, '0')
                        const endMinute = String(minute).padStart(2, '0')
                        return `${endHour}:${endMinute}`
                      })()}
                    </div>
                  )}
                </>
              ) : (
                // ドロップ先がない場合は元の日付を表示
                activeTicket.due_date && (
                  <div>📅 {activeTicket.due_date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1/$2/$3')}</div>
                )
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
