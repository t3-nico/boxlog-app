'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { getEventColor } from '@/features/calendar/theme'
import { calendarStyles } from '@/features/calendar/theme/styles'
import { cn } from '@/lib/utils'

import { HOUR_HEIGHT } from '../constants/grid.constants'

interface DirectDragSelectionProps {
  weekDates: Date[] // 週の全日付配列
  className?: string
  onTimeRangeSelect?: (selection: {
    date: Date
    startHour: number
    startMinute: number
    endHour: number
    endMinute: number
  }) => void
  onSingleClick?: (date: Date, timeString: string) => void
  children?: React.ReactNode
  disabled?: boolean
}

/**
 * マウス座標から直接日付を計算するドラッグ選択
 * CalendarDragSelectionの問題を回避する緊急ソリューション
 */
export const DirectDragSelection = ({
  weekDates,
  className,
  onTimeRangeSelect,
  onSingleClick,
  children,
  disabled = false,
}: DirectDragSelectionProps) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<{
    date: Date
    startHour: number
    startMinute: number
    endHour: number
    endMinute: number
  } | null>(null)
  const [selectionStart, setSelectionStart] = useState<{
    date: Date
    hour: number
    minute: number
    x: number
    y: number
  } | null>(null)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // マウス座標から日付と時刻を計算
  const calculateDateTimeFromMouse = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return null

      const container = containerRef.current
      const rect = container.getBoundingClientRect()

      // X座標から日付インデックスを計算
      const relativeX = clientX - rect.left
      const columnWidth = rect.width / weekDates.length
      const dateIndex = Math.floor(relativeX / columnWidth)
      const targetDate = weekDates[dateIndex] ?? weekDates[0]
      if (!targetDate) return null

      // Y座標から時刻を計算
      const relativeY = clientY - rect.top + container.scrollTop
      const hourDecimal = relativeY / HOUR_HEIGHT
      const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
      const minuteDecimal = (hourDecimal - hour) * 60
      const minute = Math.round(minuteDecimal / 15) * 15 // 15分単位

      console.log('🎯 DirectDragSelection座標計算:', {
        clientX,
        clientY,
        relativeX,
        relativeY,
        columnWidth,
        dateIndex,
        targetDate: targetDate.toDateString(),
        hour,
        minute,
        weekDatesLength: weekDates.length,
      })

      return { date: targetDate, hour, minute }
    },
    [weekDates]
  )

  // マウスダウン
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return

      const result = calculateDateTimeFromMouse(e.clientX, e.clientY)
      if (!result) return

      console.log('🎯 DirectDragSelection: ドラッグ開始:', {
        date: result.date.toDateString(),
        time: `${result.hour}:${result.minute}`,
      })

      setIsSelecting(true)
      setSelectionStart({
        date: result.date,
        hour: result.hour,
        minute: result.minute,
        x: e.clientX,
        y: e.clientY,
      })
      isDragging.current = false

      e.preventDefault()
    },
    [disabled, calculateDateTimeFromMouse]
  )

  // グローバルマウス移動とマウスアップの処理
  useEffect(() => {
    if (!isSelecting || !selectionStart) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!selectionStart) return

      // ドラッグ判定
      const deltaX = Math.abs(e.clientX - selectionStart.x)
      const deltaY = Math.abs(e.clientY - selectionStart.y)
      if (deltaX > 5 || deltaY > 10) {
        isDragging.current = true
      }

      const result = calculateDateTimeFromMouse(e.clientX, e.clientY)
      if (!result || !result.date) return

      // 同じ日付内でのみドラッグを許可
      if (result.date.getTime() !== selectionStart.date.getTime()) {
        return
      }

      let startHour = selectionStart.hour
      let startMinute = selectionStart.minute
      let endHour = result.hour
      let endMinute = result.minute

      // 上向きドラッグの場合は開始・終了を入れ替え
      if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
        ;[startHour, endHour] = [endHour, startHour]
        ;[startMinute, endMinute] = [endMinute, startMinute]
      }

      // 最低15分の選択を保証
      if (endHour === startHour && endMinute <= startMinute) {
        endMinute = startMinute + 15
        if (endMinute >= 60) {
          endHour += 1
          endMinute = 0
        }
      }

      setSelection({
        date: selectionStart.date,
        startHour: Math.max(0, startHour),
        startMinute: Math.max(0, startMinute),
        endHour: Math.min(23, endHour),
        endMinute: Math.min(59, endMinute),
      })
    }

    const handleGlobalMouseUp = () => {
      if (disabled) {
        clearSelectionState()
        return
      }

      if (selection && isDragging.current && onTimeRangeSelect) {
        console.log('🎯 DirectDragSelection: ドラッグ完了:', {
          date: selection.date.toDateString(),
          startTime: `${selection.startHour}:${selection.startMinute}`,
          endTime: `${selection.endHour}:${selection.endMinute}`,
        })

        onTimeRangeSelect(selection)
      } else if (!isDragging.current && onSingleClick && selectionStart) {
        console.log('🎯 DirectDragSelection: シングルクリック:', {
          date: selectionStart.date.toDateString(),
          time: `${selectionStart.hour}:${selectionStart.minute}`,
        })

        const timeString = `${String(selectionStart.hour).padStart(2, '0')}:${String(selectionStart.minute).padStart(2, '0')}`
        onSingleClick(selectionStart.date, timeString)
      }

      clearSelectionState()
    }

    const clearSelectionState = () => {
      setIsSelecting(false)
      setSelection(null)
      setSelectionStart(null)
      isDragging.current = false
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isSelecting, selectionStart, selection, onTimeRangeSelect, onSingleClick, calculateDateTimeFromMouse, disabled])

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
          width: '100%',
          top: `${top}px`,
          height: `${height}px`,
          pointerEvents: 'none',
          zIndex: 1000,
        }
      })()
    : null

  const selectionClassName = cn(
    getEventColor('scheduled', 'background'),
    calendarStyles.event.borderRadius,
    'border-2 border-primary opacity-50'
  )

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      className={cn('absolute inset-0', className)}
      onMouseDown={handleMouseDown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // キーボードからの操作用のダミーイベントを作成
          const rect = containerRef.current?.getBoundingClientRect()
          if (rect) {
            const mockEvent = {
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
              preventDefault: () => {},
            } as React.MouseEvent
            handleMouseDown(mockEvent)
          }
        }
      }}
      aria-label="Time slot selection area"
    >
      {children}

      {/* 選択範囲の表示 */}
      {selectionStyle != null && <div style={selectionStyle} className={selectionClassName} />}
    </div>
  )
}
