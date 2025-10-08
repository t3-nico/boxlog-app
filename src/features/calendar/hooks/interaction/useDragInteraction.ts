/**
 * ドラッグインタラクション機能を管理するフック
 */

'use client'

import { useCallback, useState } from 'react'

export interface DragState {
  isDragging: boolean
  dragStartTime: string | null
  dragEndTime: string | null
  dragDate: Date | null
}

export interface UseDragInteractionOptions {
  onDragComplete?: (result: DragResult) => void
  minDurationMinutes?: number
}

export interface DragResult {
  date: Date
  startTime: string
  endTime: string
  isValid: boolean
}

const defaultState: DragState = {
  isDragging: false,
  dragStartTime: null,
  dragEndTime: null,
  dragDate: null,
}

export function useDragInteraction(options: UseDragInteractionOptions = {}) {
  const { onDragComplete, minDurationMinutes = 15 } = options
  const [state, setState] = useState<DragState>(defaultState)

  const startDrag = useCallback((date: Date, time: string) => {
    setState({
      isDragging: true,
      dragDate: date,
      dragStartTime: time,
      dragEndTime: time,
    })
  }, [])

  const updateDrag = useCallback((date: Date, time: string) => {
    setState((prev) => {
      if (!prev.isDragging || !prev.dragDate) return prev

      // 同じ日付の場合のみドラッグを継続
      if (date.toDateString() === prev.dragDate.toDateString()) {
        return {
          ...prev,
          dragEndTime: time,
        }
      }
      return prev
    })
  }, [])

  const endDrag = useCallback(() => {
    setState((prev) => {
      if (!prev.isDragging || !prev.dragDate || !prev.dragStartTime || !prev.dragEndTime) {
        return defaultState
      }

      const startMinutes = timeToMinutes(prev.dragStartTime)
      const endMinutes = timeToMinutes(prev.dragEndTime)

      // 時間範囲の正規化と検証
      const isValidDuration = Math.abs(endMinutes - startMinutes) >= minDurationMinutes
      const finalStartTime = startMinutes <= endMinutes ? prev.dragStartTime : prev.dragEndTime
      const finalEndTime = startMinutes <= endMinutes ? prev.dragEndTime : prev.dragStartTime

      const result: DragResult = {
        date: prev.dragDate,
        startTime: finalStartTime,
        endTime: finalEndTime,
        isValid: isValidDuration,
      }

      // ドラッグ完了コールバック
      if (isValidDuration) {
        onDragComplete?.(result)
      }

      return defaultState
    })
  }, [onDragComplete, minDurationMinutes])

  const cancelDrag = useCallback(() => {
    setState(defaultState)
  }, [])

  return {
    state,
    actions: {
      startDrag,
      updateDrag,
      endDrag,
      cancelDrag,
    },
  }
}

// ユーティリティ関数
function timeToMinutes(timeString: string): number {
  const [hours = 0, minutes = 0] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}
