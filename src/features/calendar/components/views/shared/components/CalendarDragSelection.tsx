'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
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
  children?: React.ReactNode
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
  children
}: CalendarDragSelectionProps) {
  // ドラッグ選択の状態
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<TimeRange | null>(null)
  const [selectionStart, setSelectionStart] = useState<{ hour: number; minute: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // 座標から時間を計算
  const pixelsToTime = useCallback((y: number) => {
    const totalMinutes = (y / HOUR_HEIGHT) * 60
    const hour = Math.floor(totalMinutes / 60)
    const minute = Math.floor((totalMinutes % 60) / 15) * 15 // 15分単位に丸める
    return { hour: Math.max(0, Math.min(23, hour)), minute: Math.max(0, Math.min(45, minute)) }
  }, [])

  // マウスダウン開始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // イベントブロック上のクリックは無視
    const target = e.target as HTMLElement
    if (target.closest('[data-event-block]')) {
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
      endMinute: startTime.minute + 15 // 最小15分
    })
    setIsSelecting(true)
    isDragging.current = false

    e.preventDefault()
    e.stopPropagation()
  }, [pixelsToTime])

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
        endMinute = selectionStart.minute + 15
      } else {
        // 下向きにドラッグ
        startHour = selectionStart.hour
        startMinute = selectionStart.minute
        endHour = currentTime.hour
        endMinute = currentTime.minute + 15
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
      // ドラッグ後のポップアップ表示を無効化
      // onTimeRangeSelectは呼び出さない（ドラッグでのイベント作成を無効）

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
      right: 0,
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      border: '2px solid rgb(59, 130, 246)',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })() : null

  return (
    <div 
      ref={containerRef} 
      className={cn('relative', className)}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* ドラッグ選択範囲の表示 */}
      {selectionStyle && (
        <div style={selectionStyle}>
          <span className="text-white text-sm font-medium bg-blue-600 px-2 py-1 rounded">
            新しいイベント
          </span>
        </div>
      )}
    </div>
  )
}

export type { DateTimeSelection }