'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { getEventColor } from '@/features/calendar/theme'
import { calendarStyles } from '@/features/calendar/theme/styles'
import { cn } from '@/lib/utils'

import { HOUR_HEIGHT } from '../constants/grid.constants'

export interface TimeRange {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

export interface DateTimeSelection extends TimeRange {
  date: Date
}

interface CalendarDragSelectionProps {
  date: Date // 必須：この列が担当する日付
  className?: string
  onTimeRangeSelect?: (selection: DateTimeSelection) => void
  onSingleClick?: (date: Date, timeString: string) => void // 単一クリック処理
  children?: React.ReactNode
  disabled?: boolean // ドラッグ選択を無効にする
}

/**
 * 日付を知るドラッグ選択レイヤー
 * - 各カレンダー列が担当する日付を明確に持つ
 * - 全ビュー共通のドラッグ選択動作を提供
 * - 統一されたDateTimeSelectionを出力
 */
export const CalendarDragSelection = ({
  date,
  className,
  onTimeRangeSelect,
  onSingleClick,
  children,
  disabled = false,
}: CalendarDragSelectionProps) => {
  // ドラッグ選択の状態
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<TimeRange | null>(null)
  const [selectionStart, setSelectionStart] = useState<{ hour: number; minute: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // 状態をクリアするヘルパー関数
  const clearSelectionState = () => {
    setIsSelecting(false)
    setSelection(null)
    setSelectionStart(null)
    isDragging.current = false
  }

  // 時間をフォーマットするヘルパー関数
  const formatTime = (hour: number, minute: number): string => {
    const h = hour.toString().padStart(2, '0')
    const m = minute.toString().padStart(2, '0')
    return `${h}:${m}`
  }

  // 座標から時間を計算
  const pixelsToTime = useCallback((y: number) => {
    const totalMinutes = (y / HOUR_HEIGHT) * 60
    const hour = Math.floor(totalMinutes / 60)
    const minute = Math.floor((totalMinutes % 60) / 15) * 15 // 15分単位に丸める

    // 時間が24時を超える場合の処理
    if (hour >= 24) {
      return { hour: 23, minute: 45 }
    }

    return { hour: Math.max(0, hour), minute: Math.max(0, minute) }
  }, [])

  // マウスダウン開始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 無効化されている場合は何もしない
      if (disabled) {
        console.log('❌ CalendarDragSelection が無効になっています')
        e.preventDefault()
        e.stopPropagation()
        return
      }

      // イベントブロック上のクリックは無視
      const target = e.target as HTMLElement
      const eventBlock = target.closest('[data-event-block]')

      if (eventBlock) {
        return
      }

      const rect = e.currentTarget.getBoundingClientRect()
      const y = e.clientY - rect.top

      const startTime = pixelsToTime(y)

      setSelectionStart(startTime)
      setSelection({
        startHour: startTime.hour,
        startMinute: startTime.minute,
        endHour: startTime.hour,
        endMinute: startTime.minute + 15, // 最小15分
      })
      setIsSelecting(true)
      isDragging.current = false

      e.preventDefault()
      e.stopPropagation()
    },
    [pixelsToTime, disabled]
  )

  // グローバルマウスイベント（ドラッグ中）
  useEffect(() => {
    if (!isSelecting) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !selectionStart) return

      const rect = containerRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top
      const currentTime = pixelsToTime(y)

      isDragging.current = true

      let startHour, startMinute, endHour, endMinute

      if (
        currentTime.hour < selectionStart.hour ||
        (currentTime.hour === selectionStart.hour && currentTime.minute < selectionStart.minute)
      ) {
        // 上向きにドラッグ
        startHour = currentTime.hour
        startMinute = currentTime.minute
        endHour = selectionStart.hour
        endMinute = selectionStart.minute
      } else {
        // 下向きにドラッグ
        startHour = selectionStart.hour
        startMinute = selectionStart.minute
        endHour = currentTime.hour
        endMinute = currentTime.minute
      }

      // 最低15分の選択を保証
      if (endHour === startHour && endMinute <= startMinute) {
        endMinute = startMinute + 15
        if (endMinute >= 60) {
          endHour += 1
          endMinute = 0
        }
      }

      const newSelection = {
        startHour: Math.max(0, startHour),
        startMinute: Math.max(0, startMinute),
        endHour: Math.min(23, endHour),
        endMinute: Math.min(59, endMinute),
      }

      setSelection(newSelection)
    }

    const handleGlobalMouseUp = () => {
      // 無効化されている場合は何もしない
      if (disabled) {
        clearSelectionState()
        return
      }

      if (selection) {
        if (isDragging.current && onTimeRangeSelect) {
          // ドラッグした場合：時間範囲選択
          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour: selection.endHour,
            endMinute: selection.endMinute,
          }

          onTimeRangeSelect(dateTimeSelection)
        } else if (!isDragging.current && onSingleClick && selectionStart) {
          // ドラッグしなかった場合：単一クリック
          const timeString = formatTime(selectionStart.hour, selectionStart.minute)

          onSingleClick(date, timeString)
        }
      }

      clearSelectionState()
    }

    // Escキーでドラッグをキャンセル
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelectionState()
      }
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSelecting, selectionStart, selection, pixelsToTime, onTimeRangeSelect, date, disabled, onSingleClick])

  // モーダルキャンセル時のカスタムイベントリスナー
  useEffect(() => {
    const handleCalendarDragCancel = () => {
      clearSelectionState()
    }

    window.addEventListener('calendar-drag-cancel', handleCalendarDragCancel)
    return () => window.removeEventListener('calendar-drag-cancel', handleCalendarDragCancel)
  }, [])

  // 選択範囲のスタイルを計算
  const selectionStyle: React.CSSProperties | null = selection
    ? (() => {
        const startMinutes = selection.startHour * 60 + selection.startMinute
        const endMinutes = selection.endHour * 60 + selection.endMinute
        const top = startMinutes * (HOUR_HEIGHT / 60)
        const height = (endMinutes - startMinutes) * (HOUR_HEIGHT / 60)

        return {
          position: 'absolute',
          left: 0,
          width: '100%', // right:0の代わりにwidth:100%を使用
          top: `${top}px`,
          height: `${height}px`,
          pointerEvents: 'none',
          zIndex: 1000,
        }
      })()
    : null

  // scheduledカラーベースのクラス名を生成（イベントカードと同じスタイル）
  const selectionClassName = cn(
    getEventColor('scheduled', 'background'), // テーマのscheduledカラーを直接使用
    calendarStyles.event.borderRadius,
    calendarStyles.event.shadow.default,
    'pointer-events-none',
    'opacity-80' // ドラッグ中は少し透過
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      role="button"
      tabIndex={0}
      aria-label="Calendar drag selection area"
      onMouseDown={handleMouseDown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // キーボードでの選択操作の代替手段
        }
      }}
    >
      {children}

      {/* ドラッグ選択範囲の表示（イベントカードと同じスタイル） */}
      {selectionStyle && selection && (
        <div style={selectionStyle} className={selectionClassName}>
          <div
            className={cn(
              'flex h-full flex-col',
              calendarStyles.event.padding // イベントカードと同じパディング
            )}
          >
            {/* タイトル */}
            <div
              className={cn(
                getEventColor('scheduled', 'text'),
                calendarStyles.event.fontSize.title,
                'mb-1 font-medium leading-tight'
              )}
            >
              新しいイベント
            </div>

            {/* 時間表示（ドラッグ中にリアルタイム更新） */}
            <div
              className={cn(
                getEventColor('scheduled', 'text'),
                calendarStyles.event.fontSize.time,
                'leading-tight opacity-75'
              )}
            >
              {formatTime(selection.startHour, selection.startMinute)} -{' '}
              {formatTime(selection.endHour, selection.endMinute)}
            </div>

            {/* 時間幅の表示 */}
            <div
              className={cn(
                getEventColor('scheduled', 'text'),
                calendarStyles.event.fontSize.duration,
                'mt-auto opacity-60'
              )}
            >
              {(() => {
                const totalMinutes =
                  (selection.endHour - selection.startHour) * 60 + (selection.endMinute - selection.startMinute)
                const hours = Math.floor(totalMinutes / 60)
                const minutes = totalMinutes % 60
                if (hours > 0) {
                  return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`
                }
                return `${minutes}分`
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { DateTimeSelection }
