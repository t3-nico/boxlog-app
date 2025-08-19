/**
 * ドラッグ&ドロップ機能のカスタムフック
 */

'use client'

import { useState, useRef, useCallback } from 'react'

export interface DragState {
  isDragging: boolean
  dragData: any
  dragPosition: { x: number; y: number } | null
}

export interface UseDragAndDropOptions {
  onDragStart?: (data: any) => void
  onDragEnd?: (data: any) => void
  onDrop?: (data: any, target: any) => void
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const { onDragStart, onDragEnd, onDrop } = options
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragData: null,
    dragPosition: null
  })
  
  const dragDataRef = useRef<any>(null)
  
  const startDrag = useCallback((data: any, position?: { x: number; y: number }) => {
    dragDataRef.current = data
    setDragState({
      isDragging: true,
      dragData: data,
      dragPosition: position || null
    })
    onDragStart?.(data)
  }, [onDragStart])
  
  const updateDragPosition = useCallback((position: { x: number; y: number }) => {
    setDragState(prev => ({
      ...prev,
      dragPosition: position
    }))
  }, [])
  
  const endDrag = useCallback(() => {
    const data = dragDataRef.current
    setDragState({
      isDragging: false,
      dragData: null,
      dragPosition: null
    })
    dragDataRef.current = null
    onDragEnd?.(data)
  }, [onDragEnd])
  
  const handleDrop = useCallback((target: any) => {
    const data = dragDataRef.current
    if (data) {
      onDrop?.(data, target)
    }
    endDrag()
  }, [onDrop, endDrag])
  
  return {
    dragState,
    startDrag,
    updateDragPosition,
    endDrag,
    handleDrop
  }
}