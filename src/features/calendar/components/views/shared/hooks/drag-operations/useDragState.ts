/**
 * ドラッグ状態管理の専用フック
 */

'use client'

import { useCallback, useState } from 'react'

export interface DragState {
  isDragging: boolean
  isResizing: boolean
  draggedEventId: string | null
  dragStartPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  originalPosition: { top: number; left: number; width: number; height: number } | null
  snappedPosition: { top: number; height?: number | undefined; left?: number | undefined } | null
  previewTime: { start: Date; end: Date } | null
  recentlyDragged: boolean
  recentlyResized: boolean
  dragElement: HTMLElement | null
  targetDateIndex?: number | undefined
  originalDateIndex?: number | undefined
  ghostElement: HTMLElement | null
}

const initialDragState: DragState = {
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
  dragElement: null,
  ghostElement: null,
}

export function useDragState() {
  const [dragState, setDragState] = useState<DragState>(initialDragState)

  const updateDragState = useCallback((updates: Partial<DragState>) => {
    setDragState((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetDragState = useCallback(() => {
    setDragState(initialDragState)
  }, [])

  const startDrag = useCallback(
    (
      eventId: string,
      position: { x: number; y: number },
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex = 0
    ) => {
      setDragState({
        ...initialDragState,
        isDragging: true,
        draggedEventId: eventId,
        dragStartPosition: position,
        currentPosition: position,
        originalPosition,
        snappedPosition: { top: originalPosition.top },
        originalDateIndex: dateIndex,
        targetDateIndex: dateIndex,
      })
    },
    []
  )

  const startResize = useCallback(
    (
      eventId: string,
      position: { x: number; y: number },
      originalPosition: { top: number; left: number; width: number; height: number }
    ) => {
      setDragState({
        ...initialDragState,
        isResizing: true,
        draggedEventId: eventId,
        dragStartPosition: position,
        currentPosition: position,
        originalPosition,
        snappedPosition: { top: originalPosition.top, height: originalPosition.height },
      })
    },
    []
  )

  const completeDragOperation = useCallback((actuallyMoved: boolean) => {
    setDragState((prev) => ({
      ...initialDragState,
      recentlyDragged: actuallyMoved,
      recentlyResized: prev.isResizing && actuallyMoved,
    }))

    // 実際に移動した場合のみ、1秒後にrecentlyフラグを解除
    if (actuallyMoved) {
      setTimeout(() => {
        setDragState((prev) => ({
          ...prev,
          recentlyDragged: false,
          recentlyResized: false,
        }))
      }, 1000)
    }
  }, [])

  return {
    dragState,
    updateDragState,
    resetDragState,
    startDrag,
    startResize,
    completeDragOperation,
  }
}
