'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { CalendarEvent } from '@/features/events'

interface EventInteractionHandlerProps {
  date: Date
  onCreateEvent?: (date: Date, time: string, endTime?: string) => void
  onEventClick?: (event: CalendarEvent) => void
  onEventDoubleClick?: (event: CalendarEvent) => void
  onShowContextMenu?: (event: CalendarEvent, x: number, y: number) => void
  onCreateQuickEvent?: (date: Date, startTime: string, endTime: string) => void
  children: React.ReactNode
  className?: string
}

interface TimeRange {
  startTime: string
  endTime: string
  startY: number
  height: number
}

interface ClickState {
  isClicking: boolean
  startY: number
  currentY: number
  startTime: string
  isDragging: boolean
  timestamp: number
}

const HOUR_HEIGHT = 60 // 1時間の高さ（px）
const CLICK_THRESHOLD = 5 // ドラッグ判定の閾値（px）
const DOUBLE_CLICK_DELAY = 300 // ダブルクリック判定時間（ms）

export function EventInteractionHandler({
  date,
  onCreateEvent,
  onEventClick,
  onEventDoubleClick,
  onShowContextMenu,
  onCreateQuickEvent,
  children,
  className
}: EventInteractionHandlerProps) {
  const [clickState, setClickState] = useState<ClickState | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange | null>(null)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [lastClickTarget, setLastClickTarget] = useState<EventTarget | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Y座標から時刻を計算
  const getTimeFromY = useCallback((y: number): string => {
    if (!containerRef.current) return '00:00'
    
    const rect = containerRef.current.getBoundingClientRect()
    const relativeY = y - rect.top
    const scrollTop = containerRef.current.scrollTop || 0
    const totalY = relativeY + scrollTop
    
    // 15分単位にスナップ
    const totalMinutes = Math.round((totalY / HOUR_HEIGHT) * 60 / 15) * 15
    const clampedMinutes = Math.max(0, Math.min(totalMinutes, 24 * 60 - 15))
    
    const hours = Math.floor(clampedMinutes / 60)
    const minutes = clampedMinutes % 60
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }, [])

  // 時刻からY座標を計算
  const getYFromTime = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / 60) * HOUR_HEIGHT
  }, [])

  // 終了時刻を計算（最小30分）
  const calculateEndTime = useCallback((startTime: string, endY: number): string => {
    const startY = getYFromTime(startTime)
    const minEndY = startY + (HOUR_HEIGHT / 2) // 最小30分
    const actualEndY = Math.max(minEndY, endY)
    
    return getTimeFromY(actualEndY)
  }, [getTimeFromY, getYFromTime])

  // マウスダウンハンドラー
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // イベントブロック上のクリックは無視
    if ((e.target as HTMLElement).closest('[data-event-block]')) {
      return
    }

    // 右クリックは無視（コンテキストメニュー用）
    if (e.button === 2) {
      return
    }

    e.preventDefault()
    const currentTime = Date.now()
    const startTime = getTimeFromY(e.clientY)
    
    setClickState({
      isClicking: true,
      startY: e.clientY,
      currentY: e.clientY,
      startTime,
      isDragging: false,
      timestamp: currentTime
    })

    // ダブルクリック判定
    const timeDiff = currentTime - lastClickTime
    const isSameTarget = e.target === lastClickTarget
    
    if (timeDiff < DOUBLE_CLICK_DELAY && isSameTarget) {
      // ダブルクリック処理
      handleDoubleClick(e)
      return
    }
    
    setLastClickTime(currentTime)
    setLastClickTarget(e.target)
    
    // シングルクリック処理を遅延実行
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      if (clickState && !clickState.isDragging) {
        handleSingleClick(startTime)
      }
    }, DOUBLE_CLICK_DELAY)
  }, [clickState, lastClickTime, lastClickTarget, getTimeFromY])

  // マウスムーブハンドラー
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!clickState?.isClicking) return

    const deltaY = Math.abs(e.clientY - clickState.startY)
    
    // ドラッグ判定
    if (!clickState.isDragging && deltaY > CLICK_THRESHOLD) {
      setClickState(prev => prev ? { ...prev, isDragging: true } : null)
      
      // シングルクリックタイマーをキャンセル
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
    }

    if (clickState.isDragging) {
      const endTime = calculateEndTime(clickState.startTime, e.clientY)
      const startY = getYFromTime(clickState.startTime)
      const endY = getYFromTime(endTime)
      
      setTimeRange({
        startTime: clickState.startTime,
        endTime,
        startY,
        height: endY - startY
      })
    }

    setClickState(prev => prev ? { ...prev, currentY: e.clientY } : null)
  }, [clickState, calculateEndTime, getYFromTime])

  // マウスアップハンドラー
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!clickState?.isClicking) return

    if (clickState.isDragging && timeRange) {
      // ドラッグで範囲選択したイベント作成
      onCreateQuickEvent?.(date, timeRange.startTime, timeRange.endTime)
    }

    setClickState(null)
    setTimeRange(null)
  }, [clickState, timeRange, date, onCreateQuickEvent])

  // シングルクリック処理
  const handleSingleClick = useCallback((time: string) => {
    // 30分のイベントを作成
    const [hours, minutes] = time.split(':').map(Number)
    let endHours = hours
    let endMinutes = minutes + 30
    
    if (endMinutes >= 60) {
      endHours += 1
      endMinutes = 0
    }
    
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
    onCreateEvent?.(date, time, endTime)
  }, [date, onCreateEvent])

  // ダブルクリック処理
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // クリックタイマーをキャンセル
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
    
    setClickState(null)
    setTimeRange(null)
    
    // イベント詳細モーダルを表示
    // TODO: イベント詳細モーダルの実装
    console.log('ダブルクリック: 詳細モーダル表示', { date, time: getTimeFromY(e.clientY) })
  }, [date, getTimeFromY])

  // コンテキストメニューハンドラー
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    const eventElement = (e.target as HTMLElement).closest('[data-event-block]')
    if (eventElement) {
      // イベント上での右クリック
      const eventId = eventElement.getAttribute('data-event-id')
      if (eventId && onShowContextMenu) {
        // TODO: イベントデータの取得
        console.log('イベント右クリック:', { eventId, x: e.clientX, y: e.clientY })
      }
    } else {
      // 空き時間での右クリック
      const time = getTimeFromY(e.clientY)
      console.log('空き時間右クリック:', { date, time, x: e.clientX, y: e.clientY })
    }
  }, [date, getTimeFromY, onShowContextMenu])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  // グローバルマウスイベント処理
  useEffect(() => {
    if (!clickState?.isClicking) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e as any)
    }

    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleMouseUp(e as any)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [clickState, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {children}
      
      {/* 時間範囲選択プレビュー */}
      {timeRange && (
        <div
          className="absolute left-1 right-1 bg-primary/20 border-2 border-primary/50 rounded-md pointer-events-none z-30"
          style={{
            top: `${timeRange.startY}px`,
            height: `${timeRange.height}px`
          }}
        >
          <div className="absolute inset-x-2 top-1 text-xs font-medium text-primary">
            {timeRange.startTime} - {timeRange.endTime}
          </div>
        </div>
      )}
    </div>
  )
}