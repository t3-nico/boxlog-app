'use client'

import React, { useCallback } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { format, parse, setHours, setMinutes, startOfDay } from 'date-fns'
import { toast } from 'sonner'

import { useTicketMutations } from '@/features/tickets/hooks/useTicketMutations'

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

  // ドラッグセンサー設定（ポインターでドラッグ）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動したらドラッグ開始
      },
    })
  )

  /**
   * ドラッグ終了時の処理
   *
   * **ドロップ先データ形式**:
   * - over.data.current.date: Date | string (YYYY-MM-DD)
   * - over.data.current.time: string (HH:mm) | undefined
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      // ドロップ先がない場合は何もしない
      if (!over) {
        console.log('[DnDProvider] ドロップ先なし')
        return
      }

      // ドラッグ元のTicket ID
      const ticketId = active.id as string

      // ドロップ先のデータ
      const dropData = over.data?.current
      if (!dropData || !dropData.date) {
        console.warn('[DnDProvider] ドロップ先データが不正:', dropData)
        toast.error('ドロップ先が無効です')
        return
      }

      console.log('[DnDProvider] ドラッグ終了:', {
        ticketId,
        dropData,
      })

      try {
        // 1. 日付を取得（Date型 または YYYY-MM-DD文字列）
        let targetDate: Date
        if (dropData.date instanceof Date) {
          targetDate = dropData.date
        } else if (typeof dropData.date === 'string') {
          targetDate = parse(dropData.date, 'yyyy-MM-dd', new Date())
        } else {
          throw new Error('日付形式が不正です')
        }

        // 日付が無効な場合
        if (isNaN(targetDate.getTime())) {
          throw new Error('日付が無効です')
        }

        // 2. due_date（YYYY-MM-DD）
        const due_date = format(targetDate, 'yyyy-MM-dd')

        // 3. 時刻を取得
        let start_time: string | undefined
        let end_time: string | undefined

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

          // start_time: 日付 + 開始時刻
          let startDateTime = startOfDay(targetDate)
          startDateTime = setHours(startDateTime, hour)
          startDateTime = setMinutes(startDateTime, minute)
          start_time = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss")

          // end_time: 開始時刻 + 1時間（デフォルト）
          const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)
          end_time = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss")

          console.log('[DnDProvider] 時間指定イベント:', {
            due_date,
            start_time,
            end_time,
          })
        } else {
          // 時間指定なし（終日イベント）
          start_time = undefined
          end_time = undefined

          console.log('[DnDProvider] 終日イベント:', {
            due_date,
          })
        }

        // 4. Ticket更新
        updateTicket.mutate({
          id: ticketId,
          data: {
            due_date,
            start_time,
            end_time,
          },
        })
      } catch (error) {
        console.error('[DnDProvider] ドロップ処理エラー:', error)
        toast.error(error instanceof Error ? error.message : 'ドロップに失敗しました')
      }
    },
    [updateTicket]
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  )
}
