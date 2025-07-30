'use client'

import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { cn } from '@/lib/utils'

export interface DraggedEventData {
  id: string
  title: string
  startTime: Date
  endTime: Date
  originalTop: number
  originalHeight: number
}

interface DraggableEventProps {
  id: string
  title: string
  startTime: Date
  endTime: Date
  top: number
  height: number
  color: string
  left: number
  width: number
  onEdit: () => void
  onDelete: () => void
  children: React.ReactNode
}

export const DRAG_TYPE = {
  EVENT: 'event'
} as const

export function DraggableEvent({
  id,
  title,
  startTime,
  endTime,
  top,
  height,
  color,
  left,
  width,
  onEdit,
  onDelete,
  children
}: DraggableEventProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE.EVENT,
    item: (): DraggedEventData => ({
      id,
      title,
      startTime,
      endTime,
      originalTop: top,
      originalHeight: height
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  drag(ref)

  return (
    <div
      ref={ref}
      className={cn(
        "absolute cursor-move transition-opacity",
        isDragging && "opacity-50"
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: color,
        left: `${left}%`,
        width: `${width}%`
      }}
    >
      {children}
    </div>
  )
}