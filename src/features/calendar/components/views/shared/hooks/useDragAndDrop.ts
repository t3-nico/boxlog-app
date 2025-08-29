'use client'

import React, { useState, useCallback, useRef } from 'react'
import { HOUR_HEIGHT } from '../constants/grid.constants'
import { calendarColors } from '@/features/calendar/theme'
import useCalendarToast from '@/features/calendar/lib/toast'

export interface DragState {
  isDragging: boolean
  isResizing: boolean
  draggedEventId: string | null
  dragStartPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  originalPosition: { top: number; left: number; width: number; height: number } | null
  snappedPosition: { top: number; height?: number; left?: number } | null // leftを追加
  previewTime: { start: Date; end: Date } | null
  recentlyDragged: boolean // ドラッグ終了直後のクリック防止用
  recentlyResized: boolean // リサイズ終了直後のクリック防止用（より厳格）
  ghostElement: HTMLElement | null // ゴースト要素
  targetDateIndex?: number // ドラッグ先の日付インデックス（日付間移動用）
  originalDateIndex?: number // ドラッグ元の日付インデックス
}

export interface DragHandlers {
  handleMouseDown: (eventId: string, e: React.MouseEvent, originalPosition: { top: number; left: number; width: number; height: number }, dateIndex?: number) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  handleEventDrop: (eventId: string, newStartTime: Date) => void
  handleResizeStart: (eventId: string, direction: 'top' | 'bottom', e: React.MouseEvent, originalPosition: { top: number; left: number; width: number; height: number }) => void
}

interface UseDragAndDropProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  date: Date  // DayViewでは単一日付、他のビューでは基準日付
  events: any[] // イベントデータを受け取る
  displayDates?: Date[] // WeekView/TwoWeekView/ThreeDayView用の日付配列
  viewMode?: 'day' | 'week' | '2week' | '3day' // ビューモード
}

/**
 * カレンダービュー共通のドラッグ&ドロップ機能
 * 全てのビュー（Day, Week, ThreeDay等）で利用可能
 * 高機能版：ゴースト要素、詳細な状態管理、5px移動閾値、日付間移動を含む
 */
export function useDragAndDrop({ onEventUpdate, date, events, displayDates, viewMode = 'day' }: UseDragAndDropProps) {
  const calendarToast = useCalendarToast()
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
    startX: number
    startY: number
    originalTop: number
    eventDuration: number
    hasMoved: boolean // マウスが実際に移動したかの判定
    originalElement: HTMLElement | null // 元の要素への参照
    originalDateIndex: number // ドラッグ開始時の日付インデックス
    columnWidth?: number // カラムの幅（日付間移動用）
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
    originalPosition: { top: number; left: number; width: number; height: number },
    dateIndex: number = 0 // 日付インデックス（デフォルトは0）
  ) => {
    // 左クリック以外は無視
    if (e.button !== 0) return
    
    
    e.preventDefault()
    e.stopPropagation()

    const startPosition = { x: e.clientX, y: e.clientY }
    
    // 元のイベント要素を取得
    const originalElement = (e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement
    
    // カラム幅を計算（日付間移動用）
    let columnWidth = 0
    if (viewMode !== 'day' && displayDates) {
      // 複数の方法でグリッドコンテナを取得
      const gridContainer = (originalElement?.closest('.flex') as HTMLElement) ||
                           (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
                           (originalElement?.parentElement?.parentElement as HTMLElement)
      
      if (gridContainer && gridContainer.offsetWidth > 0) {
        const totalWidth = gridContainer.offsetWidth
        columnWidth = totalWidth / displayDates.length
      } else {
        // フォールバック: ビューポート幅ベース
        columnWidth = window.innerWidth / displayDates.length * 0.75
      }
    }
    
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
      startX: e.clientX,
      startY: e.clientY,
      originalTop: originalPosition.top,
      eventDuration: originalPosition.height,
      hasMoved: false,
      originalElement,
      originalDateIndex: dateIndex,
      columnWidth
    }

    setDragState({
      isDragging: true,
      isResizing: false,
      draggedEventId: eventId,
      dragStartPosition: startPosition,
      currentPosition: startPosition,
      originalPosition,
      snappedPosition: { 
        top: originalPosition.top
      },
      previewTime: null,
      recentlyDragged: false,
      recentlyResized: false,
      ghostElement,
      originalDateIndex: dateIndex,
      targetDateIndex: dateIndex
    })
  }, [createGhostElement, viewMode])

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
    const deltaX = e.clientX - dragData.startX
    const deltaY = e.clientY - dragData.startY
    
    // 5px以上移動した場合のみドラッグ/リサイズと判定
    if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
      dragData.hasMoved = true
    }
    
    // 大きな水平移動時のみログ出力
    if (Math.abs(deltaX) > 30) {
      console.log('🔧 水平移動検出:', { deltaX, columnWidth: dragData.columnWidth })
    }
    
    // 日付インデックスを計算（複数日付ビューの場合）- 大きな水平移動のみ反応
    let targetDateIndex = dragData.originalDateIndex
    if (viewMode !== 'day' && displayDates && Math.abs(deltaX) > 30) { // 閾値を30pxに下げて試す
      // 複数の方法でグリッドコンテナを取得（ドラッグ中も同じ方法で）
      const gridContainer = (dragData.originalElement?.closest('.flex')) as HTMLElement ||
                           (document.querySelector('.flex.h-full.relative') as HTMLElement) ||
                           (dragData.originalElement?.parentElement?.parentElement as HTMLElement)
      
      if (gridContainer && dragData.columnWidth > 0) {
        const rect = gridContainer.getBoundingClientRect()
        const relativeX = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) // 境界内に制限
        
        // より確実なカラムインデックス計算
        const columnIndex = Math.floor(relativeX / dragData.columnWidth)
        const newTargetIndex = Math.max(0, Math.min(displayDates.length - 1, columnIndex))
        
        // 元の日付から大きく離れた場合のみ更新
        if (Math.abs(newTargetIndex - dragData.originalDateIndex) > 0) {
          targetDateIndex = newTargetIndex
          
          console.log('🔧 日付間移動:', {
            originalIndex: dragData.originalDateIndex,
            newTargetIndex,
            targetDate: displayDates[newTargetIndex]?.toDateString?.()
          })
        }
      }
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
      
      // 水平方向の位置計算（他の日付への移動時のみ）
      let snappedLeft = undefined // デフォルトは元の位置を維持
      
      if (viewMode !== 'day' && displayDates && targetDateIndex !== dragData.originalDateIndex) {
        // 異なる日付カラムに移動した場合のみ、その日付位置にスナップ
        const columnWidthPercent = 100 / displayDates.length
        snappedLeft = targetDateIndex * columnWidthPercent + 1 // 1%のマージン
        
        console.log('🔧 日付間移動 - 水平移動実行:', {
          originalDateIndex: dragData.originalDateIndex,
          targetDateIndex,
          columnWidthPercent,
          snappedLeft
        })
      }
      
      // プレビュー時間を計算（日付変更を考慮）
      const event = events.find(e => e.id === dragData.eventId)
      let durationMs = 60 * 60 * 1000 // デフォルト1時間
      
      if (event?.startDate && event?.endDate) {
        durationMs = event.endDate.getTime() - event.startDate.getTime()
      } else if (dragData.eventDuration) {
        durationMs = (dragData.eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
      }
      
      // ターゲット日付を決定（エッジケース対応）
      let targetDate = date
      if (viewMode !== 'day' && displayDates && displayDates[targetDateIndex]) {
        targetDate = displayDates[targetDateIndex]
      }
      
      // 日付が無効な場合は元の日付を使用
      if (!targetDate || isNaN(targetDate.getTime())) {
        targetDate = date
      }
      
      const previewStartTime = new Date(targetDate)
      previewStartTime.setHours(hour, minute, 0, 0)
      const previewEndTime = new Date(previewStartTime.getTime() + durationMs)
      
      const currentPosition = { x: e.clientX, y: e.clientY }
      
      setDragState(prev => ({
        ...prev,
        currentPosition,
        snappedPosition: { 
          top: snappedTop, 
          ...(snappedLeft !== undefined && { left: snappedLeft }) // 他の日付への移動時のみleftを設定
        },
        previewTime: { start: previewStartTime, end: previewEndTime },
        targetDateIndex
      }))
    }
  }, [dragState.isDragging, dragState.isResizing, snapToQuarterHour, events, date, viewMode, displayDates])

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
          const previousEndTime = event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)
          
          // イベント更新を実行
          try {
            const promise = onEventUpdate(dragDataRef.current.eventId, { 
              startTime: event.startDate, 
              endTime: newEndTime 
            })
            
            // Calendar Toast用のイベントデータを準備
            const eventData = {
              id: event.id,
              title: event.title || 'イベント',
              displayStartDate: event.startDate,
              displayEndDate: newEndTime,
              duration: Math.round(newDurationMs / (1000 * 60)), // 分単位
              isMultiDay: event.startDate.toDateString() !== newEndTime.toDateString(),
              isRecurring: false
            }
            
            // Promiseが返される場合
            if (promise && typeof promise.then === 'function') {
              promise.then(() => {
                // リサイズ成功のToast表示
                calendarToast.eventUpdated(eventData)
              }).catch((error: any) => {
                console.error('Failed to resize event:', error)
                calendarToast.error('予定のリサイズに失敗しました')
              })
            } else {
              // 同期的な場合（Promiseが返されない場合）
              // リサイズ成功として扱う
              calendarToast.eventUpdated(eventData)
            }
          } catch (error) {
            console.error('Failed to resize event:', error)
            calendarToast.error('予定のリサイズに失敗しました')
          }
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

    const deltaX = dragState.currentPosition.x - dragState.dragStartPosition.x
    const deltaY = dragState.currentPosition.y - dragState.dragStartPosition.y
    const newTop = dragDataRef.current.originalTop + deltaY

    // 新しい時刻を計算（15分単位に丸める）
    const hourDecimal = newTop / HOUR_HEIGHT
    const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
    const minute = Math.round(Math.max(0, (hourDecimal - hour) * 60 / 15)) * 15

    // ターゲット日付を決定（日付間移動を考慮、エッジケース対応）
    const targetDateIndex = dragState.targetDateIndex || dragDataRef.current.originalDateIndex
    let targetDate = date
    
    if (viewMode !== 'day' && displayDates && displayDates[targetDateIndex]) {
      targetDate = displayDates[targetDateIndex]
    }
    
    // 日付が無効な場合は元の日付を使用
    if (!targetDate || isNaN(targetDate.getTime())) {
      targetDate = date
    }

    // 新しい開始時刻を作成
    const newStartTime = new Date(targetDate)
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
      
      // エッジケース: 終了時刻が開始時刻より前の場合は修正
      if (newEndTime <= newStartTime) {
        newEndTime.setTime(newStartTime.getTime() + 60 * 60 * 1000) // 最低1時間の期間
      }
      
      // イベント更新を実行
      try {
        const promise = onEventUpdate(dragDataRef.current.eventId, {
          startTime: newStartTime,
          endTime: newEndTime
        })
        
        // Calendar Toast用のイベントデータを準備
        const event = events.find(e => e.id === dragDataRef.current!.eventId)
        const previousStartTime = event?.startDate || date
        
        if (event) {
          const eventData = {
            id: event.id,
            title: event.title || 'イベント',
            displayStartDate: newStartTime,
            displayEndDate: new Date(newStartTime.getTime() + durationMs),
            duration: Math.round(durationMs / (1000 * 60)), // 分単位
            isMultiDay: false,
            isRecurring: false
          }
        
          // Promiseが返される場合
          if (promise && typeof promise.then === 'function') {
            promise.then(() => {
              // 移動成功のToast表示
              calendarToast.eventMoved(eventData, newStartTime, {
                undoAction: async () => {
                  try {
                    const originalEndTime = new Date(previousStartTime.getTime() + durationMs)
                    await onEventUpdate(dragDataRef.current!.eventId, {
                      startTime: previousStartTime,
                      endTime: originalEndTime
                    })
                    calendarToast.success('移動を取り消しました')
                  } catch (error) {
                    calendarToast.error('取り消しに失敗しました')
                  }
                }
              })
            }).catch((error: any) => {
              console.error('Failed to update event time:', error)
              calendarToast.error('予定の移動に失敗しました')
            })
          } else {
            // 同期的な場合（Promiseが返されない場合）
            // 移動成功として扱う
            calendarToast.eventMoved(eventData, newStartTime)
          }
        }
      } catch (error) {
        console.error('Failed to update event time:', error)
        calendarToast.error('予定の移動に失敗しました')
      }
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

    // 実際にドラッグが発生した場合のみ、1000ms後にrecentlyDraggedを解除（長めに設定）
    if (actuallyDragged) {
      setTimeout(() => {
        setDragState(prev => ({ ...prev, recentlyDragged: false }))
      }, 1000)
    }
  }, [dragState, onEventUpdate, date, viewMode, displayDates, events])

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
      startX: e.clientX,
      startY: e.clientY,
      originalTop: originalPosition.top,
      eventDuration: originalPosition.height,
      hasMoved: false,
      originalElement: null,
      originalDateIndex: 0,
      columnWidth: undefined
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
      recentlyResized: false,
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