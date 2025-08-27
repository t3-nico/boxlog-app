'use client'

import React, { useState, useCallback, useRef } from 'react'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useToast } from '@/components/shadcn-ui/toast'

export interface DragState {
  isDragging: boolean
  draggedEventId: string | null
  dragStartPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  originalPosition: { top: number; left: number; width: number; height: number } | null
  snappedPosition: { top: number } | null
  previewTime: { start: Date; end: Date } | null
  recentlyDragged: boolean // ドラッグ終了直後のクリック防止用
}

export interface DragHandlers {
  handleMouseDown: (eventId: string, e: React.MouseEvent, originalPosition: { top: number; left: number; width: number; height: number }) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  handleEventDrop: (eventId: string, newStartTime: Date) => void
}

interface UseDragAndDropProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  date: Date
  events: any[] // イベントデータを受け取る
}

export function useDragAndDrop({ onEventUpdate, date, events }: UseDragAndDropProps) {
  const { success } = useToast()
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEventId: null,
    dragStartPosition: null,
    currentPosition: null,
    originalPosition: null,
    snappedPosition: null,
    previewTime: null,
    recentlyDragged: false
  })

  const dragDataRef = useRef<{
    eventId: string
    startY: number
    originalTop: number
    eventDuration: number
    hasMoved: boolean // マウスが実際に移動したかの判定
  } | null>(null)

  // ドラッグ開始
  const handleMouseDown = useCallback((
    eventId: string, 
    e: React.MouseEvent, 
    originalPosition: { top: number; left: number; width: number; height: number }
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const startPosition = { x: e.clientX, y: e.clientY }
    
    // ドラッグデータを設定
    dragDataRef.current = {
      eventId,
      startY: e.clientY,
      originalTop: originalPosition.top,
      eventDuration: originalPosition.height,
      hasMoved: false
    }

    setDragState({
      isDragging: true,
      draggedEventId: eventId,
      dragStartPosition: startPosition,
      currentPosition: startPosition,
      originalPosition,
      snappedPosition: { top: originalPosition.top },
      previewTime: null
    })
  }, [])

  // 15分単位でスナップする関数
  const snapToQuarterHour = useCallback((yPosition: number): { snappedTop: number; hour: number; minute: number } => {
    const hourDecimal = yPosition / HOUR_HEIGHT
    const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
    const minuteDecimal = (hourDecimal - hour) * 60
    const minute = Math.round(minuteDecimal / 15) * 15 // 15分単位にスナップ
    
    const snappedTop = (hour + minute / 60) * HOUR_HEIGHT
    
    return { snappedTop, hour, minute: Math.min(minute, 59) }
  }, [])

  // マウス移動処理
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragDataRef.current) return

    const deltaY = e.clientY - dragDataRef.current.startY
    const newTop = dragDataRef.current.originalTop + deltaY
    
    // 5px以上移動した場合のみドラッグと判定
    if (Math.abs(deltaY) > 5) {
      dragDataRef.current.hasMoved = true
    }
    
    // 15分単位にスナップ
    const { snappedTop, hour, minute } = snapToQuarterHour(newTop)
    
    // プレビュー時間を計算
    const event = events.find(e => e.id === dragDataRef.current!.eventId)
    let durationMs = 60 * 60 * 1000 // デフォルト1時間
    
    if (event?.startDate && event?.endDate) {
      durationMs = event.endDate.getTime() - event.startDate.getTime()
    } else if (dragDataRef.current.eventDuration) {
      durationMs = (dragDataRef.current.eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
    }
    
    const previewStartTime = new Date(date)
    previewStartTime.setHours(hour, minute, 0, 0)
    const previewEndTime = new Date(previewStartTime.getTime() + durationMs)
    
    const currentPosition = { x: e.clientX, y: e.clientY }
    
    setDragState(prev => ({
      ...prev,
      currentPosition,
      snappedPosition: { top: snappedTop },
      previewTime: { start: previewStartTime, end: previewEndTime }
    }))
  }, [dragState.isDragging, snapToQuarterHour, events, date])

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragDataRef.current || !dragState.currentPosition || !dragState.dragStartPosition) {
      setDragState({
        isDragging: false,
        draggedEventId: null,
        dragStartPosition: null,
        currentPosition: null,
        originalPosition: null,
        snappedPosition: null,
        previewTime: null,
        recentlyDragged: false
      })
      dragDataRef.current = null
      return
    }

    const deltaY = dragState.currentPosition.y - dragState.dragStartPosition.y
    const newTop = dragDataRef.current.originalTop + deltaY

    // 新しい時刻を計算（15分単位に丸める）
    const hourDecimal = newTop / HOUR_HEIGHT
    const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
    const minute = Math.round(Math.max(0, (hourDecimal - hour) * 60 / 15)) * 15

    // 新しい開始時刻を作成
    const newStartTime = new Date(date)
    newStartTime.setHours(hour, minute, 0, 0)

    // イベント更新を実行（実際にドラッグが発生した場合のみ）
    if (onEventUpdate && dragDataRef.current.eventId && dragDataRef.current.hasMoved) {
      // 実際のイベントデータから期間を計算
      const event = events.find(e => e.id === dragDataRef.current.eventId)
      let durationMs = 60 * 60 * 1000 // デフォルト1時間
      
      if (event?.startDate && event?.endDate) {
        durationMs = event.endDate.getTime() - event.startDate.getTime()
      } else if (dragDataRef.current.eventDuration) {
        durationMs = (dragDataRef.current.eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
      }
      
      const newEndTime = new Date(newStartTime.getTime() + durationMs)
      
      // 非同期でイベント更新を実行
      onEventUpdate(dragDataRef.current.eventId, {
        startTime: newStartTime,
        endTime: newEndTime
      }).then(() => {
        // Toast通知のみを表示（詳細モーダルは開かない）
        const event = events.find(e => e.id === dragDataRef.current!.eventId)
        const eventTitle = event?.title || 'イベント'
        const timeFormat = `${newStartTime.getHours()}:${newStartTime.getMinutes().toString().padStart(2, '0')}`
        
        success('イベントを移動しました', `${eventTitle}を${timeFormat}に移動しました`)
      }).catch((error) => {
        console.error('Failed to update event time:', error)
      })
    }

    // 実際にドラッグが発生した場合のみrecentlyDraggedを設定
    const actuallyDragged = dragDataRef.current?.hasMoved || false
    
    // ドラッグ状態をリセット
    setDragState({
      isDragging: false,
      draggedEventId: null,
      dragStartPosition: null,
      currentPosition: null,
      originalPosition: null,
      snappedPosition: null,
      previewTime: null,
      recentlyDragged: actuallyDragged // 実際にドラッグした場合のみクリック無効化
    })
    dragDataRef.current = null

    // 実際にドラッグが発生した場合のみ、300ms後にrecentlyDraggedを解除
    if (actuallyDragged) {
      setTimeout(() => {
        setDragState(prev => ({ ...prev, recentlyDragged: false }))
      }, 300)
    }
  }, [dragState, onEventUpdate, date])

  // イベントドロップのヘルパー
  const handleEventDrop = useCallback((eventId: string, newStartTime: Date) => {
    if (onEventUpdate) {
      // イベントの元の期間を取得して新しい終了時刻を計算
      const event = events.find(e => e.id === eventId)
      let durationMs = 60 * 60 * 1000 // デフォルト1時間
      
      if (event?.startDate && event?.endDate) {
        durationMs = event.endDate.getTime() - event.startDate.getTime()
      }
      
      const newEndTime = new Date(newStartTime.getTime() + durationMs)
      onEventUpdate(eventId, { startTime: newStartTime, endTime: newEndTime })
    }
  }, [onEventUpdate, events])

  return {
    dragState,
    handlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleEventDrop
    }
  }
}