'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { DragDataRef, DragState, UseDragAndDropProps } from './types'
import { initialDragState } from './types'
import { useDragHandler } from './useDragHandler'
import { useResizeHandler } from './useResizeHandler'
import {
  calculateNewTime,
  calculateTargetDateIndex,
  cleanupDragElements,
  createDragElement,
  getConstrainedPosition,
} from './utils'

/**
 * カレンダービュー共通のドラッグ&ドロップ機能
 * 全てのビュー（Day, Week, ThreeDay等）で利用可能
 * 高機能版：ゴースト要素、詳細な状態管理、5px移動閾値、日付間移動を含む
 */
export function useDragAndDrop({
  onEventUpdate,
  onPlanUpdate,
  onEventClick,
  onPlanClick,
  date,
  events,
  displayDates,
  viewMode = 'day',
  disabledPlanId,
}: UseDragAndDropProps) {
  const eventUpdateHandler = onEventUpdate || onPlanUpdate
  const eventClickHandler = onEventClick || onPlanClick

  // eventClickHandler の最新参照を保持（クロージャー問題を回避）
  // 重要: useRef の初期値として eventClickHandler を設定し、毎回の render で同期更新も行う
  const eventClickHandlerRef = useRef(eventClickHandler)
  // 同期的に毎レンダリングで最新値に更新（useEffect は非同期なので遅れる可能性がある）
  eventClickHandlerRef.current = eventClickHandler

  // events の最新参照を保持
  const eventsRef = useRef(events)
  eventsRef.current = events

  const [dragState, setDragState] = useState<DragState>(initialDragState)
  const dragDataRef = useRef<DragDataRef | null>(null)

  // Resize handler
  const {
    handleResizing,
    handleResize,
    handleResizeStart: originalHandleResizeStart,
  } = useResizeHandler({
    events,
    eventUpdateHandler,
    dragDataRef,
    setDragState,
  })

  // handleResizeStart をラップして disabledPlanId をチェック
  const handleResizeStart = useCallback(
    (
      eventId: string,
      direction: 'top' | 'bottom',
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number }
    ) => {
      // 無効化されたプランの場合はリサイズを開始しない
      if (disabledPlanId && eventId === disabledPlanId) {
        return
      }
      originalHandleResizeStart(eventId, direction, e, originalPosition)
    },
    [originalHandleResizeStart, disabledPlanId]
  )

  // Drag handler
  const { handleMouseDown, handleDragging, handleEventDrop, handleEventClick, executeEventUpdate } = useDragHandler({
    events,
    date,
    displayDates,
    viewMode,
    eventUpdateHandler,
    eventClickHandler,
    dragDataRef,
    setDragState,
  })

  // 状態リセット
  const resetDragState = useCallback(() => {
    setDragState(initialDragState)
    dragDataRef.current = null
  }, [])

  // ドラッグ要素のクリーンアップ
  const cleanupDrag = useCallback(() => {
    cleanupDragElements(dragState.dragElement, dragDataRef.current?.originalElement || null)
  }, [dragState.dragElement])

  // リサイズ完了処理
  const handleResizeComplete = useCallback(() => {
    handleResize(dragState.snappedPosition?.height)

    const actuallyResized = dragDataRef.current?.hasMoved ?? false

    setDragState({
      ...initialDragState,
      recentlyDragged: actuallyResized,
      recentlyResized: actuallyResized,
    })

    dragDataRef.current = null

    if (actuallyResized) {
      setTimeout(() => {
        setDragState((prev) => ({ ...prev, recentlyDragged: false, recentlyResized: false }))
      }, 1000)
    }
  }, [handleResize, dragState.snappedPosition?.height])

  // ドラッグ完了後の状態リセット
  const completeDragOperation = useCallback((actuallyDragged: boolean) => {
    setDragState({
      ...initialDragState,
      recentlyDragged: actuallyDragged,
    })
    dragDataRef.current = null

    if (actuallyDragged) {
      setTimeout(() => {
        setDragState((prev) => ({
          ...prev,
          recentlyDragged: false,
        }))
      }, 1000)
    }
  }, [])

  // マウス移動処理
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // isPending（準備状態）、isDragging、isResizing のいずれかでなければ終了
      if ((!dragState.isPending && !dragState.isDragging && !dragState.isResizing) || !dragDataRef.current) return

      const dragData = dragDataRef.current
      const { constrainedX, constrainedY } = getConstrainedPosition(e.clientX, e.clientY)
      const deltaX = constrainedX - dragData.startX
      const deltaY = constrainedY - dragData.startY

      // 5px以上移動したら hasMoved = true
      if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
        dragData.hasMoved = true

        // isPending状態で5px移動したら、isDraggingに遷移
        if (dragState.isPending && !dragState.isDragging) {
          // ゴースト要素を作成（ドラッグ開始時に初めて作成）
          let dragElement: HTMLElement | null = null
          let initialRect: DOMRect | null = null
          if (dragData.originalElement && !dragData.dragElement) {
            const result = createDragElement(dragData.originalElement)
            dragElement = result.dragElement
            initialRect = result.initialRect
            dragData.dragElement = dragElement
            dragData.initialRect = initialRect
          }

          setDragState((prev) => ({
            ...prev,
            isPending: false,
            isDragging: true,
            dragElement: dragElement ?? prev.dragElement,
          }))
        }
      }

      const targetDateIndex = calculateTargetDateIndex(
        constrainedX,
        dragData.originalDateIndex,
        dragData.hasMoved,
        dragData.originalElement,
        dragData.columnWidth,
        deltaX,
        viewMode,
        displayDates
      )

      if (dragState.isResizing) {
        handleResizing(constrainedX, constrainedY, deltaY)
      } else if (dragState.isDragging) {
        handleDragging(constrainedX, constrainedY, deltaX, deltaY, targetDateIndex)
      }
    },
    [
      dragState.isPending,
      dragState.isDragging,
      dragState.isResizing,
      viewMode,
      displayDates,
      handleResizing,
      handleDragging,
      setDragState,
    ]
  )

  // ドラッグ終了
  const handleMouseUp = useCallback(async () => {
    cleanupDrag()

    // isPending状態（移動なし）の場合はクリックとして処理
    if (dragState.isPending && !dragState.isDragging && !dragState.isResizing) {
      if (handleEventClick()) {
        resetDragState()
        return
      }
      // クリックハンドラーがなくてもリセット
      resetDragState()
      return
    }

    if (handleEventClick()) {
      resetDragState()
      return
    }

    if (
      (!dragState.isDragging && !dragState.isResizing) ||
      !dragDataRef.current ||
      !dragState.currentPosition ||
      !dragState.dragStartPosition
    ) {
      resetDragState()
      return
    }

    if (dragState.isResizing) {
      handleResizeComplete()
      return
    }

    const deltaY = dragState.currentPosition.y - dragState.dragStartPosition.y
    const newTop = dragDataRef.current.originalTop + deltaY
    const targetDateIndex =
      dragState.targetDateIndex !== undefined ? dragState.targetDateIndex : dragDataRef.current.originalDateIndex

    const newStartTime = calculateNewTime(newTop, targetDateIndex, date, viewMode, displayDates, dragDataRef.current)

    await executeEventUpdate(newStartTime)

    const actuallyDragged = dragDataRef.current?.hasMoved || false
    completeDragOperation(actuallyDragged)
  }, [
    dragState,
    date,
    viewMode,
    displayDates,
    cleanupDrag,
    handleEventClick,
    resetDragState,
    handleResizeComplete,
    executeEventUpdate,
    completeDragOperation,
  ])

  // handleMouseDown をラップして disabledPlanId をチェック
  // クリック処理は handleMouseUp で isPending 状態をチェックして行う
  const wrappedHandleMouseDown = useCallback(
    (
      eventId: string,
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex?: number
    ) => {
      // 無効化されたプランの場合はDnDを開始せず、クリックのみ処理
      if (disabledPlanId && eventId === disabledPlanId) {
        // クリックハンドラーがあれば呼び出す
        const eventToClick = events.find((ev) => ev.id === eventId)
        if (eventToClick && eventClickHandler) {
          eventClickHandler(eventToClick)
        }
        return
      }

      // 元の handleMouseDown を呼び出し
      // クリック判定は handleMouseUp で行う（isPending状態かつhasMoved=falseの場合）
      handleMouseDown(eventId, e, originalPosition, dateIndex)
    },
    [handleMouseDown, eventClickHandler, events, disabledPlanId]
  )

  // マウスイベントリスナーを設定（ドラッグ/リサイズ用）
  // isPending状態でもリスナーを登録（5px移動検知のため）
  useEffect(() => {
    if (dragState.isPending || dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return undefined
  }, [dragState.isPending, dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  return {
    dragState,
    disabledPlanId,
    handlers: {
      handleMouseDown: wrappedHandleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleEventDrop,
      handleResizeStart,
    },
  }
}
