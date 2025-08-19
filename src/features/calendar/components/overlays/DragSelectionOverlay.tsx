/**
 * ドラッグ選択範囲の視覚化コンポーネント
 */

'use client'

import { cn } from '@/lib/utils'
import type { InteractionState } from '@/features/calendar/hooks/interaction/useInteractionManager'

interface DragSelectionOverlayProps {
  dragState: {
    isDragging: boolean
    dragStartTime: string | null
    dragEndTime: string | null
    dragDate: Date | null
  }
  hourHeight?: number
  className?: string
}

// ユーティリティ関数
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

export function DragSelectionOverlay({ 
  dragState, 
  hourHeight = 72,
  className 
}: DragSelectionOverlayProps) {
  if (!dragState.isDragging || !dragState.dragDate || !dragState.dragStartTime || !dragState.dragEndTime) {
    return null
  }

  const startMinutes = timeToMinutes(dragState.dragStartTime)
  const endMinutes = timeToMinutes(dragState.dragEndTime)
  
  const top = Math.min(startMinutes, endMinutes) * (hourHeight / 60)
  const height = Math.abs(endMinutes - startMinutes) * (hourHeight / 60)

  return (
    <div
      className={cn(
        "absolute left-0 right-0 bg-blue-200/50 border border-blue-400 pointer-events-none z-20",
        className
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`
      }}
    >
      <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
      <div className="absolute top-1 left-2 text-xs text-blue-700 font-medium">
        {dragState.dragStartTime} - {dragState.dragEndTime}
      </div>
    </div>
  )
}