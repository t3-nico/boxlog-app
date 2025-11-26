/**
 * ドラッグ&ドロップ機能のカスタムフック
 */

'use client'

import { useCallback, useRef, useState } from 'react'

export interface DragState<TData = unknown> {
  isDragging: boolean
  dragData: TData | null
  dragPosition: { x: number; y: number } | null
}

export interface UseDragAndDropOptions<TData = unknown, TTarget = unknown> {
  onDragStart?: (data: TData) => void
  onDragEnd?: (data: TData) => void
  onDrop?: (data: TData, target: TTarget) => void
}

export function useDragAndDrop<TData = unknown, TTarget = unknown>(
  options: UseDragAndDropOptions<TData, TTarget> = {}
) {
  const { onDragStart, onDragEnd, onDrop } = options

  const [dragState, setDragState] = useState<DragState<TData>>({
    isDragging: false,
    dragData: null,
    dragPosition: null,
  })

  const dragDataRef = useRef<TData | null>(null)

  const startDrag = useCallback(
    (data: TData, position?: { x: number; y: number }) => {
      dragDataRef.current = data
      setDragState({
        isDragging: true,
        dragData: data,
        dragPosition: position || null,
      })
      onDragStart?.(data)
    },
    [onDragStart]
  )

  const updateDragPosition = useCallback((position: { x: number; y: number }) => {
    setDragState((prev) => ({
      ...prev,
      dragPosition: position,
    }))
  }, [])

  const endDrag = useCallback(() => {
    const data = dragDataRef.current
    setDragState({
      isDragging: false,
      dragData: null,
      dragPosition: null,
    })
    dragDataRef.current = null
    if (data) {
      onDragEnd?.(data)
    }
  }, [onDragEnd])

  const handleDrop = useCallback(
    (target: TTarget) => {
      const data = dragDataRef.current
      if (data) {
        onDrop?.(data, target)
      }
      endDrag()
    },
    [onDrop, endDrag]
  )

  return {
    dragState,
    startDrag,
    updateDragPosition,
    endDrag,
    handleDrop,
  }
}
