/**
 * ドラッグ選択範囲の視覚化コンポーネント
 */

'use client'

import { cn } from '@/lib/utils'

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
  const [hours = 0, minutes = 0] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

export const DragSelectionOverlay = ({ dragState, hourHeight = 72, className }: DragSelectionOverlayProps) => {
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
        'border-primary bg-primary/20 pointer-events-none absolute right-0 left-0 z-20 border',
        className
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
    >
      <div className="bg-primary/10 absolute inset-0 animate-pulse" />
      <div className="text-primary absolute top-1 left-2 text-xs font-medium">
        {dragState.dragStartTime} - {dragState.dragEndTime}
      </div>
    </div>
  )
}
