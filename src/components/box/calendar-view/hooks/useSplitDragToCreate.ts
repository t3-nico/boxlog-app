import { useState, useCallback, useEffect } from 'react'
import { addMinutes, differenceInMinutes } from 'date-fns'
import { HOUR_HEIGHT } from '../constants/grid-constants'

interface SplitDragState {
  isDragging: boolean
  startDate: Date | null
  endDate: Date | null
  startX: number
  startY: number
  currentX: number
  currentY: number
  side: 'left' | 'right' | null
}

interface UseSplitDragToCreateProps {
  containerRef: React.RefObject<HTMLElement>
  gridInterval?: number
  onCreateItem: (item: {
    start: Date
    end: Date
    side: 'left' | 'right'
  }) => void
}

export function useSplitDragToCreate({
  containerRef,
  gridInterval = 15,
  onCreateItem
}: UseSplitDragToCreateProps) {
  const [dragState, setDragState] = useState<SplitDragState>({
    isDragging: false,
    startDate: null,
    endDate: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    side: null
  })

  // Y座標から時間を取得
  const getTimeFromY = useCallback((y: number, container: HTMLElement): Date => {
    const rect = container.getBoundingClientRect()
    const relativeY = y - rect.top + container.scrollTop
    const totalMinutes = (relativeY / (24 * HOUR_HEIGHT)) * (24 * 60)
    
    // グリッド間隔にスナップ
    const snappedMinutes = Math.round(totalMinutes / gridInterval) * gridInterval
    const clampedMinutes = Math.max(0, Math.min(snappedMinutes, 24 * 60 - gridInterval))
    
    const result = new Date()
    result.setHours(0, 0, 0, 0)
    result.setMinutes(clampedMinutes)
    
    return result
  }, [gridInterval])

  // X座標から左右を判定
  const getSideFromX = useCallback((x: number): 'left' | 'right' => {
    const container = containerRef.current
    if (!container) return 'left'

    const rect = container.getBoundingClientRect()
    const relativeX = x - rect.left
    const centerX = rect.width / 2

    return relativeX < centerX ? 'left' : 'right'
  }, [containerRef])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 既存のカードをクリックした場合は無視
    if ((e.target as HTMLElement).closest('[data-task-card]')) return
    
    // ラベルエリアをクリックした場合は無視
    if ((e.target as HTMLElement).closest('[data-split-label]')) return

    const container = containerRef.current
    if (!container) return

    const side = getSideFromX(e.clientX)
    const startTime = getTimeFromY(e.clientY, container)

    setDragState({
      isDragging: true,
      startDate: startTime,
      endDate: addMinutes(startTime, 30), // デフォルト30分
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      side
    })

    e.preventDefault()
    e.stopPropagation()
  }, [containerRef, getSideFromX, getTimeFromY])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.startDate || !containerRef.current) return

    const endTime = getTimeFromY(e.clientY, containerRef.current)
    const minEnd = addMinutes(dragState.startDate, gridInterval)

    // ドラッグ方向に応じて開始・終了時刻を調整
    let finalStart: Date
    let finalEnd: Date

    if (endTime > dragState.startDate) {
      // 下向きドラッグ
      finalStart = dragState.startDate
      finalEnd = endTime
    } else {
      // 上向きドラッグ
      finalStart = endTime
      finalEnd = dragState.startDate
    }

    // 最小時間を確保
    if (differenceInMinutes(finalEnd, finalStart) < gridInterval) {
      finalEnd = addMinutes(finalStart, gridInterval)
    }

    setDragState(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY,
      startDate: finalStart,
      endDate: finalEnd
    }))
  }, [dragState, containerRef, getTimeFromY, gridInterval])

  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.startDate || !dragState.endDate || !dragState.side) return

    const duration = differenceInMinutes(dragState.endDate, dragState.startDate)
    if (duration >= gridInterval) {
      onCreateItem({
        start: dragState.startDate,
        end: dragState.endDate,
        side: dragState.side
      })
    }

    setDragState({
      isDragging: false,
      startDate: null,
      endDate: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      side: null
    })
  }, [dragState, onCreateItem, gridInterval])

  const handleMouseLeave = useCallback(() => {
    // コンテナから出た場合もドラッグを終了
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, isDragging: false }))
    }
  }, [dragState.isDragging])

  // マウスイベントリスナーの設定
  useEffect(() => {
    if (!dragState.isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e)
    }

    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleMouseUp()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDragState({
          isDragging: false,
          startDate: null,
          endDate: null,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          side: null
        })
      }
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp])

  return {
    dragState,
    handleMouseDown,
    handleMouseLeave,
    dragPreview: dragState.isDragging && dragState.side && dragState.startDate && dragState.endDate ? {
      start: dragState.startDate,
      end: dragState.endDate,
      side: dragState.side
    } : null
  }
}