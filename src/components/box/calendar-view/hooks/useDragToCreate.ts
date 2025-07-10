import { useState, useRef, useCallback, useEffect } from 'react'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { addMinutes, differenceInMinutes } from 'date-fns'

interface DragState {
  isDragging: boolean
  startDate: Date | null
  endDate: Date | null
  startY: number
  currentY: number
  column: number // 複数日表示の場合のカラム
}

interface UseDragToCreateOptions {
  gridInterval: number // 15, 30, 60分
  onCreateTask: (task: { start: Date, end: Date, column?: number }) => void
  containerRef: React.RefObject<HTMLElement>
  disabled?: boolean
  hourHeight?: number
}

export function useDragToCreate({
  gridInterval,
  onCreateTask,
  containerRef,
  disabled = false,
  hourHeight = 60
}: UseDragToCreateOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDate: null,
    endDate: null,
    startY: 0,
    currentY: 0,
    column: 0
  })
  
  const { defaultDuration } = useCalendarSettingsStore()
  
  // Y座標から時間を計算
  const getTimeFromY = useCallback((y: number, baseDate: Date): Date => {
    const container = containerRef.current
    if (!container) return baseDate
    
    const rect = container.getBoundingClientRect()
    const relativeY = y - rect.top + container.scrollTop
    const totalMinutes = (relativeY / (24 * hourHeight)) * 24 * 60
    
    // グリッドにスナップ
    const snappedMinutes = Math.round(totalMinutes / gridInterval) * gridInterval
    
    const result = new Date(baseDate)
    result.setHours(0, 0, 0, 0)
    result.setMinutes(snappedMinutes)
    
    return result
  }, [gridInterval, containerRef, hourHeight])
  
  // ドラッグ開始
  const handleMouseDown = useCallback((e: React.MouseEvent, date: Date, column = 0) => {
    if (disabled) return
    
    // 既存のタスクがある場所では作成しない
    const target = e.target as HTMLElement
    if (target.closest('[data-task-card]') || target.closest('[data-draggable-task]')) return
    
    const startTime = getTimeFromY(e.clientY, date)
    
    setDragState({
      isDragging: true,
      startDate: startTime,
      endDate: addMinutes(startTime, defaultDuration),
      startY: e.clientY,
      currentY: e.clientY,
      column
    })
    
    e.preventDefault()
    e.stopPropagation()
  }, [disabled, getTimeFromY, defaultDuration])
  
  // ドラッグ中
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.startDate) return
    
    const endTime = getTimeFromY(e.clientY, dragState.startDate)
    
    // 最小15分は確保
    const minEnd = addMinutes(dragState.startDate, 15)
    const actualEnd = endTime > minEnd ? endTime : minEnd
    
    setDragState(prev => ({
      ...prev,
      currentY: e.clientY,
      endDate: actualEnd
    }))
  }, [dragState.isDragging, dragState.startDate, getTimeFromY])
  
  // ドラッグ終了
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.startDate || !dragState.endDate) return
    
    // 最小時間（15分）以上の場合のみ作成
    const duration = differenceInMinutes(dragState.endDate, dragState.startDate)
    if (duration >= 15) {
      onCreateTask({
        start: dragState.startDate,
        end: dragState.endDate,
        column: dragState.column
      })
    }
    
    // リセット
    setDragState({
      isDragging: false,
      startDate: null,
      endDate: null,
      startY: 0,
      currentY: 0,
      column: 0
    })
  }, [dragState, onCreateTask])
  
  // タッチ開始
  const handleTouchStart = useCallback((e: React.TouchEvent, date: Date, column = 0) => {
    if (disabled || e.touches.length !== 1) return
    
    // 既存のタスクがある場所では作成しない
    const target = e.target as HTMLElement
    if (target.closest('[data-task-card]') || target.closest('[data-draggable-task]')) return
    
    const touch = e.touches[0]
    const startTime = getTimeFromY(touch.clientY, date)
    
    setDragState({
      isDragging: true,
      startDate: startTime,
      endDate: addMinutes(startTime, defaultDuration),
      startY: touch.clientY,
      currentY: touch.clientY,
      column
    })
    
    e.preventDefault()
  }, [disabled, getTimeFromY, defaultDuration])
  
  // タッチ移動
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging || !dragState.startDate || e.touches.length !== 1) return
    
    const touch = e.touches[0]
    const endTime = getTimeFromY(touch.clientY, dragState.startDate)
    
    // 最小15分は確保
    const minEnd = addMinutes(dragState.startDate, 15)
    const actualEnd = endTime > minEnd ? endTime : minEnd
    
    setDragState(prev => ({
      ...prev,
      currentY: touch.clientY,
      endDate: actualEnd
    }))
    
    e.preventDefault()
  }, [dragState.isDragging, dragState.startDate, getTimeFromY])
  
  // タッチ終了
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!dragState.isDragging || !dragState.startDate || !dragState.endDate) return
    
    // 最小時間（15分）以上の場合のみ作成
    const duration = differenceInMinutes(dragState.endDate, dragState.startDate)
    if (duration >= 15) {
      onCreateTask({
        start: dragState.startDate,
        end: dragState.endDate,
        column: dragState.column
      })
    }
    
    // リセット
    setDragState({
      isDragging: false,
      startDate: null,
      endDate: null,
      startY: 0,
      currentY: 0,
      column: 0
    })
  }, [dragState, onCreateTask])
  
  // グローバルイベントリスナー
  useEffect(() => {
    if (dragState.isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
      const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e)
      const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e)
      const handleGlobalTouchEnd = (e: TouchEvent) => handleTouchEnd(e)
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
      
      // ドラッグ中はテキスト選択を無効化
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
        document.removeEventListener('touchmove', handleGlobalTouchMove)
        document.removeEventListener('touchend', handleGlobalTouchEnd)
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
      }
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])
  
  return {
    dragState,
    handleMouseDown,
    handleTouchStart,
    dragPreview: dragState.isDragging ? {
      start: dragState.startDate!,
      end: dragState.endDate!,
      column: dragState.column
    } : null
  }
}