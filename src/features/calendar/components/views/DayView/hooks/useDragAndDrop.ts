'use client'

import React, { useState, useCallback, useRef } from 'react'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useToast } from '@/components/shadcn-ui/toast'
import { calendarColors } from '@/features/calendar/theme'

export interface DragState {
  isDragging: boolean
  isResizing: boolean
  draggedEventId: string | null
  dragStartPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  originalPosition: { top: number; left: number; width: number; height: number } | null
  snappedPosition: { top: number; height?: number } | null
  previewTime: { start: Date; end: Date } | null
  recentlyDragged: boolean // ドラッグ終了直後のクリック防止用
  recentlyResized: boolean // リサイズ終了直後のクリック防止用（より厳格）
  ghostElement: HTMLElement | null // ゴースト要素
}

export interface DragHandlers {
  handleMouseDown: (eventId: string, e: React.MouseEvent, originalPosition: { top: number; left: number; width: number; height: number }) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  handleEventDrop: (eventId: string, newStartTime: Date) => void
  handleResizeStart: (eventId: string, direction: 'top' | 'bottom', e: React.MouseEvent, originalPosition: { top: number; left: number; width: number; height: number }) => void
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
    isResizing: false,
    draggedEventId: null,
    dragStartPosition: null,
    currentPosition: null,
    originalPosition: null,
    snappedPosition: null,
    previewTime: null,
    recentlyDragged: false,
    recentlyResized: false,
    ghostElement: null
  })

  const dragDataRef = useRef<{
    eventId: string
    startY: number
    originalTop: number
    eventDuration: number
    hasMoved: boolean // マウスが実際に移動したかの判定
    originalElement: HTMLElement | null // 元の要素への参照
  } | null>(null)

  // ゴースト要素作成
  const createGhostElement = useCallback((originalElement: HTMLElement, originalPosition: { top: number; left: number; width: number; height: number }) => {
    const ghost = originalElement.cloneNode(true) as HTMLElement
    
    // 元のクラスをクリアして、scheduledのactiveカラーを適用
    ghost.className = ''
    ghost.classList.add('rounded-md', 'shadow-sm', 'px-2', 'py-1', 'overflow-hidden')
    
    // scheduledのactiveカラーを適用（colors.tsから参照）
    const activeColorClasses = calendarColors.event.scheduled.active?.split(' ') || []
    activeColorClasses.forEach(cls => {
      if (cls) ghost.classList.add(cls)
    })
    
    // ゴーストのスタイル設定（元の位置に固定）
    ghost.style.position = 'absolute'
    ghost.style.top = `${originalPosition.top}px`
    ghost.style.left = `${originalPosition.left}%`
    ghost.style.width = `${originalPosition.width}%`
    ghost.style.height = `${originalPosition.height}px`
    ghost.style.opacity = '0.6'
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '500' // ドラッグ要素より低い
    ghost.style.transition = 'none'
    ghost.classList.add('event-ghost')
    
    return ghost
  }, [])

  // ドラッグ開始
  const handleMouseDown = useCallback((
    eventId: string, 
    e: React.MouseEvent, 
    originalPosition: { top: number; left: number; width: number; height: number }
  ) => {
    // 左クリック以外は無視
    if (e.button !== 0) return
    
    e.preventDefault()
    e.stopPropagation()

    const startPosition = { x: e.clientX, y: e.clientY }
    
    // 元のイベント要素を取得
    const originalElement = (e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement
    
    // ゴースト要素作成
    let ghostElement: HTMLElement | null = null
    if (originalElement) {
      ghostElement = createGhostElement(originalElement, originalPosition)
      
      // カレンダーグリッドの親要素にゴーストを挿入
      const calendarGrid = originalElement.closest('[data-calendar-grid]') || originalElement.closest('.absolute.inset-0')
      if (calendarGrid) {
        const eventArea = calendarGrid.querySelector('.absolute.inset-0:last-child')
        if (eventArea) {
          eventArea.appendChild(ghostElement)
        }
      }
    }
    
    // ドラッグデータを設定
    dragDataRef.current = {
      eventId,
      startY: e.clientY,
      originalTop: originalPosition.top,
      eventDuration: originalPosition.height,
      hasMoved: false,
      originalElement
    }

    setDragState({
      isDragging: true,
      draggedEventId: eventId,
      dragStartPosition: startPosition,
      currentPosition: startPosition,
      originalPosition,
      snappedPosition: { top: originalPosition.top },
      previewTime: null,
      recentlyDragged: false,
      ghostElement
    })
  }, [createGhostElement])

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
    if ((!dragState.isDragging && !dragState.isResizing) || !dragDataRef.current) return

    const dragData = dragDataRef.current
    const deltaY = e.clientY - dragData.startY
    
    // 5px以上移動した場合のみドラッグ/リサイズと判定
    if (Math.abs(deltaY) > 5) {
      dragData.hasMoved = true
    }
    
    if (dragState.isResizing) {
      // リサイズ処理
      const newHeight = Math.max(15, dragData.eventDuration + deltaY) // 最小15px
      const { snappedTop: snappedHeight } = snapToQuarterHour(newHeight)
      const finalHeight = Math.max(HOUR_HEIGHT / 4, snappedHeight) // 最小15分
      
      // リサイズ中のプレビュー時間を計算
      const event = events.find(e => e.id === dragData.eventId)
      let previewTime = null
      
      if (event?.startDate) {
        const newDurationMs = (finalHeight / HOUR_HEIGHT) * 60 * 60 * 1000
        const previewEndTime = new Date(event.startDate.getTime() + newDurationMs)
        previewTime = { start: event.startDate, end: previewEndTime }
      }
      
      setDragState(prev => ({
        ...prev,
        currentPosition: { x: e.clientX, y: e.clientY },
        snappedPosition: { 
          top: dragData.originalTop, 
          height: finalHeight
        },
        previewTime
      }))
    } else if (dragState.isDragging) {
      // ドラッグ処理
      const newTop = dragData.originalTop + deltaY
      const { snappedTop, hour, minute } = snapToQuarterHour(newTop)
      
      // プレビュー時間を計算
      const event = events.find(e => e.id === dragData.eventId)
      let durationMs = 60 * 60 * 1000 // デフォルト1時間
      
      if (event?.startDate && event?.endDate) {
        durationMs = event.endDate.getTime() - event.startDate.getTime()
      } else if (dragData.eventDuration) {
        durationMs = (dragData.eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
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
    }
  }, [dragState.isDragging, dragState.isResizing, snapToQuarterHour, events, date])

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    // ゴースト要素のクリーンアップ
    if (dragState.ghostElement && dragState.ghostElement.parentElement) {
      dragState.ghostElement.parentElement.removeChild(dragState.ghostElement)
    }

    if ((!dragState.isDragging && !dragState.isResizing) || !dragDataRef.current || !dragState.currentPosition || !dragState.dragStartPosition) {
      setDragState({
        isDragging: false,
        isResizing: false,
        draggedEventId: null,
        dragStartPosition: null,
        currentPosition: null,
        originalPosition: null,
        snappedPosition: null,
        previewTime: null,
        recentlyDragged: false,
        recentlyResized: false,
        ghostElement: null
      })
      dragDataRef.current = null
      return
    }

    if (dragState.isResizing) {
      // リサイズ終了処理
      console.log('🟡 リサイズ終了:', { 
        eventId: dragDataRef.current.eventId,
        newHeight: dragState.snappedPosition?.height
      })
      
      // 実際にリサイズが発生した場合のみ更新
      if (onEventUpdate && dragDataRef.current.hasMoved && dragState.snappedPosition?.height) {
        const event = events.find(e => e.id === dragDataRef.current.eventId)
        if (event?.startDate) {
          const newDurationMs = (dragState.snappedPosition.height / HOUR_HEIGHT) * 60 * 60 * 1000
          const newEndTime = new Date(event.startDate.getTime() + newDurationMs)
          
          onEventUpdate(dragDataRef.current.eventId, { 
            startTime: event.startDate, 
            endTime: newEndTime 
          })
        }
      }
      
      // リサイズが実際に発生したかを記録
      const actuallyResized = dragDataRef.current.hasMoved
      
      // リサイズ状態をリセット
      setDragState({
        isDragging: false,
        isResizing: false,
        draggedEventId: null,
        dragStartPosition: null,
        currentPosition: null,
        originalPosition: null,
        snappedPosition: null,
        previewTime: null,
        recentlyDragged: actuallyResized, // 実際にリサイズした場合のみクリック無効化
        recentlyResized: actuallyResized, // リサイズ専用フラグ（より厳格）
        ghostElement: null
      })
      
      dragDataRef.current = null
      
      // 実際にリサイズが発生した場合のみ、1000ms後にフラグを解除（リサイズは長い無効化が必要）
      if (actuallyResized) {
        setTimeout(() => {
          setDragState(prev => ({ ...prev, recentlyDragged: false, recentlyResized: false }))
        }, 1000)
      }
      
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
      isResizing: false,
      draggedEventId: null,
      dragStartPosition: null,
      currentPosition: null,
      originalPosition: null,
      snappedPosition: null,
      previewTime: null,
      recentlyDragged: actuallyDragged, // 実際にドラッグした場合のみクリック無効化
      recentlyResized: false, // ドラッグ終了時はリサイズフラグをクリア
      ghostElement: null
    })
    dragDataRef.current = null

    // 実際にドラッグが発生した場合のみ、500ms後にrecentlyDraggedを解除
    if (actuallyDragged) {
      setTimeout(() => {
        setDragState(prev => ({ ...prev, recentlyDragged: false }))
      }, 500)
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

  // リサイズ開始
  const handleResizeStart = useCallback((
    eventId: string,
    direction: 'top' | 'bottom',
    e: React.MouseEvent,
    originalPosition: { top: number; left: number; width: number; height: number }
  ) => {
    // 左クリック以外は無視
    if (e.button !== 0) return
    
    console.log('🟡 リサイズ開始:', { eventId, direction, originalPosition })
    
    const startPosition = { x: e.clientX, y: e.clientY }
    
    // ドラッグデータを設定
    dragDataRef.current = {
      eventId,
      startY: e.clientY,
      originalTop: originalPosition.top,
      eventDuration: originalPosition.height,
      hasMoved: false,
      originalElement: null
    }

    setDragState({
      isDragging: false,
      isResizing: true,
      draggedEventId: eventId,
      dragStartPosition: startPosition,
      currentPosition: startPosition,
      originalPosition,
      snappedPosition: { top: originalPosition.top, height: originalPosition.height },
      previewTime: null,
      recentlyDragged: false,
      ghostElement: null
    })
  }, [])

  return {
    dragState,
    handlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleEventDrop,
      handleResizeStart
    }
  }
}