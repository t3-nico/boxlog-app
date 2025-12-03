'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { DragDataRef, DragState, UseDragAndDropProps } from './types'
import { initialDragState } from './types'
import { useDragHandler } from './useDragHandler'
import { useResizeHandler } from './useResizeHandler'
import { calculateNewTime, calculateTargetDateIndex, cleanupDragElements, getConstrainedPosition } from './utils'

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
}: UseDragAndDropProps) {
  const eventUpdateHandler = onEventUpdate || onPlanUpdate
  const eventClickHandler = onEventClick || onPlanClick

  const [dragState, setDragState] = useState<DragState>(initialDragState)
  const dragDataRef = useRef<DragDataRef | null>(null)

  // Resize handler
  const { handleResizing, handleResize, handleResizeStart } = useResizeHandler({
    events,
    eventUpdateHandler,
    dragDataRef,
    setDragState,
  })

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
      if ((!dragState.isDragging && !dragState.isResizing) || !dragDataRef.current) return

      const dragData = dragDataRef.current
      const { constrainedX, constrainedY } = getConstrainedPosition(e.clientX, e.clientY)
      const deltaX = constrainedX - dragData.startX
      const deltaY = constrainedY - dragData.startY

      if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
        dragData.hasMoved = true
      }

      if (Math.abs(deltaX) > 30) {
        console.log('🔧 水平移動検出:', { deltaX, columnWidth: dragData.columnWidth })
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
    [dragState.isDragging, dragState.isResizing, viewMode, displayDates, handleResizing, handleDragging]
  )

  // ドラッグ終了
  const handleMouseUp = useCallback(async () => {
    cleanupDrag()

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

  // マウスイベントリスナーを設定
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return undefined
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  return {
    dragState,
    handlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleEventDrop,
      handleResizeStart,
    },
  }
}
