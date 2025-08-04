'use client'

import React, { useRef, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/events'

export interface DraggedEventData {
  event: CalendarEvent
  dayIndex: number
  originalTop: number
  mouseOffsetY: number // マウスカーソルとカード上部のオフセット
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
  
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: DRAG_TYPE.EVENT,
    item: (monitor): DraggedEventData => {
      const initialClientOffset = monitor.getInitialClientOffset()
      
      // マウスカーソルとカード上部のオフセットを計算
      let mouseOffsetY = 0
      if (initialClientOffset && ref.current) {
        const rect = ref.current.getBoundingClientRect()
        mouseOffsetY = initialClientOffset.y - rect.top
      }
      
      console.log('🎯 ドラッグ開始:', { 
        event: event.title, 
        dayIndex, 
        topPosition,
        mouseOffsetY,
        cardTop: ref.current?.getBoundingClientRect().top
      })
      
      return {
        event,
        dayIndex,
        originalTop: topPosition,
        mouseOffsetY
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
  }), [event, dayIndex, topPosition])

  // カスタムドラッグプレビューを使用するため、デフォルトのプレビューを無効化
  useEffect(() => {
    preview(new Image(), { captureDraggingState: true })
  }, [preview])

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
        isDragging ? "opacity-20 cursor-grabbing" : "cursor-pointer hover:cursor-grab active:cursor-grabbing"
      )}
      style={style}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}