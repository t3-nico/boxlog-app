'use client'

import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/events'

export interface DraggedEventData {
  event: CalendarEvent
  dayIndex: number
  originalTop: number
}

interface DraggableEventProps {
  event: CalendarEvent
  dayIndex: number
  topPosition: number
  onEventClick?: (event: CalendarEvent) => void
  style: React.CSSProperties
  children: React.ReactNode
}

export const DRAG_TYPE = {
  EVENT: 'calendar-event'
} as const

export function DraggableEvent({
  event,
  dayIndex,
  topPosition,
  onEventClick,
  style,
  children
}: DraggableEventProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE.EVENT,
    item: (): DraggedEventData => {
      console.log('🎯 ドラッグ開始:', { event: event.title, dayIndex, topPosition })
      return {
        event,
        dayIndex,
        originalTop: topPosition
      }
    },
    end: (_, monitor) => {
      const didDrop = monitor.didDrop()
      const dropResult = monitor.getDropResult()
      console.log('🎯 ドラッグ終了:', { 
        event: event.title, 
        didDrop, 
        dropResult: !!dropResult 
      })
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  drag(ref)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEventClick) {
      onEventClick(event)
    }
  }

  return (
    <div
      ref={ref}
      data-event="true"
      className={cn(
        "absolute rounded-md hover:shadow-lg transition-all duration-200 z-20 border border-white/20",
        isDragging ? "opacity-50 cursor-grabbing" : "cursor-pointer hover:cursor-grab"
      )}
      style={style}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}