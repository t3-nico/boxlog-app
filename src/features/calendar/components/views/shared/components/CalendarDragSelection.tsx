'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { HOUR_HEIGHT } from '../constants/grid.constants'
import { getEventColor } from '@/features/calendar/theme'
import { calendarStyles } from '@/features/calendar/theme/styles'

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
export function CalendarDragSelection({
  date,
  className,
  onTimeRangeSelect,
  onSingleClick,
  children,
  disabled = false
}: CalendarDragSelectionProps) {
  
  console.log('🟢 CalendarDragSelection マウント:', {
    date: date.toDateString(),
    disabled,
    hasOnTimeRangeSelect: !!onTimeRangeSelect,
    hasOnSingleClick: !!onSingleClick,
    className
  })
  // ドラッグ選択の状態
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<TimeRange | null>(null)
  const [selectionStart, setSelectionStart] = useState<{ hour: number; minute: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  
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
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('🔴 handleMouseDown呼び出し:', {
      disabled,
      button: e.button,
      target: (e.target as HTMLElement).tagName
    })
    
    // 無効化されている場合は何もしない
    if (disabled) {
      console.log('❌ CalendarDragSelection が無効になっています')
      return
    }
    
    // イベントブロック上のクリックは無視
    const target = e.target as HTMLElement
    const eventBlock = target.closest('[data-event-block]')
    console.log('🔍 クリック対象チェック:', {
      targetTag: target.tagName,
      targetClass: target.className,
      hasEventBlock: !!eventBlock,
      eventBlockData: eventBlock?.getAttribute('data-event-block')
    })
    
    if (eventBlock) {
      console.log('🚫 イベントブロック上のクリック - CalendarDragSelection無視')
      return
    }
    
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    
    const startTime = pixelsToTime(y)
    
    console.log('🟦 ドラッグ開始:', {
      マウスY座標: e.clientY,
      計算された時間: startTime,
      フォーマット済み: `${startTime.hour}:${String(startTime.minute).padStart(2, '0')}`
    })
    
    setSelectionStart(startTime)
    setSelection({
      startHour: startTime.hour,
      startMinute: startTime.minute,
      endHour: startTime.hour,
      endMinute: startTime.minute + 15 // 最小15分
    })
    setIsSelecting(true)
    isDragging.current = false

    e.preventDefault()
    e.stopPropagation()
  }, [pixelsToTime, disabled])

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
      
      if (currentTime.hour < selectionStart.hour || 
          (currentTime.hour === selectionStart.hour && currentTime.minute < selectionStart.minute)) {
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
        endMinute: Math.min(59, endMinute)
      }
      
      setSelection(newSelection)
    }

    const handleGlobalMouseUp = () => {
      if (selection) {
        if (isDragging.current && onTimeRangeSelect) {
          // ドラッグした場合：時間範囲選択
          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour: selection.endHour,
            endMinute: selection.endMinute
          }
          
          console.log('🟥 ドラッグ終了:', {
            開始時間: selectionStart,
            終了時間: selection,
            開始フォーマット: `${selectionStart?.hour}:${String(selectionStart?.minute).padStart(2, '0')}`,
            終了フォーマット: `${selection.endHour}:${String(selection.endMinute).padStart(2, '0')}`,
            最終選択範囲: `${selection.startHour}:${String(selection.startMinute).padStart(2, '0')} → ${selection.endHour}:${String(selection.endMinute).padStart(2, '0')}`
          })
          
          onTimeRangeSelect(dateTimeSelection)
        } else if (!isDragging.current && onSingleClick && selectionStart) {
          // ドラッグしなかった場合：単一クリック
          const timeString = formatTime(selectionStart.hour, selectionStart.minute)
          
          console.log('🟨 単一クリック:', {
            クリック時間: selectionStart,
            フォーマット済み: timeString
          })
          
          onSingleClick(date, timeString)
        }
      }

      setIsSelecting(false)
      setTimeout(() => {
        setSelection(null)
        setSelectionStart(null)
        setTimeout(() => {
          isDragging.current = false
        }, 50)
      }, 100)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isSelecting, selectionStart, selection, pixelsToTime, onTimeRangeSelect, date])

  // 選択範囲のスタイルを計算
  const selectionStyle: React.CSSProperties | null = selection ? (() => {
    const startMinutes = selection.startHour * 60 + selection.startMinute
    const endMinutes = selection.endHour * 60 + selection.endMinute
    const top = startMinutes * (HOUR_HEIGHT / 60)
    const height = (endMinutes - startMinutes) * (HOUR_HEIGHT / 60)
    
    return {
      position: 'absolute',
      left: 0,
      width: '100%',  // right:0の代わりにwidth:100%を使用
      top: `${top}px`,
      height: `${height}px`,
      pointerEvents: 'none',
      zIndex: 1000
    }
  })() : null

  // scheduledカラーベースのクラス名を生成（イベントカードと同じスタイル）
  const selectionClassName = cn(
    getEventColor('scheduled', 'background'),  // テーマのscheduledカラーを直接使用
    calendarStyles.event.borderRadius,
    calendarStyles.event.shadow.default,
    'pointer-events-none',
    'opacity-80'  // ドラッグ中は少し透過
  )

  return (
    <div 
      ref={containerRef} 
      className={cn('relative', className)}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* ドラッグ選択範囲の表示（イベントカードと同じスタイル） */}
      {selectionStyle && selection && (
        <div style={selectionStyle} className={selectionClassName}>
          <div className={cn(
            'flex flex-col h-full',
            calendarStyles.event.padding  // イベントカードと同じパディング
          )}>
            {/* タイトル */}
            <div className={cn(
              getEventColor('scheduled', 'text'),
              calendarStyles.event.fontSize.title,
              'font-medium leading-tight mb-1'
            )}>
              新しいイベント
            </div>
            
            {/* 時間表示（ドラッグ中にリアルタイム更新） */}
            <div className={cn(
              getEventColor('scheduled', 'text'),
              calendarStyles.event.fontSize.time,
              'opacity-75 leading-tight'
            )}>
              {formatTime(selection.startHour, selection.startMinute)} - {formatTime(selection.endHour, selection.endMinute)}
            </div>
            
            {/* 時間幅の表示 */}
            <div className={cn(
              getEventColor('scheduled', 'text'),
              calendarStyles.event.fontSize.duration,
              'opacity-60 mt-auto'
            )}>
              {(() => {
                const totalMinutes = (selection.endHour - selection.startHour) * 60 + (selection.endMinute - selection.startMinute)
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