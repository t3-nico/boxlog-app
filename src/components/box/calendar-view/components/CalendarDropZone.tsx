'use client'

import React from 'react'
import { useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { addMinutes, startOfDay, differenceInMinutes } from 'date-fns'
import { DRAG_TYPE, DraggedEventData } from './DraggableEvent'

interface CalendarDropZoneProps {
  date: Date
  onEventDrop: (eventId: string, newStartTime: Date, newEndTime: Date) => void
  children: React.ReactNode
  className?: string
}

const MINUTES_PER_PIXEL = 1440 / 960 // 24時間 / 960px

export function CalendarDropZone({
  date,
  onEventDrop,
  children,
  className
}: CalendarDropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DRAG_TYPE.EVENT,
    drop: (item: DraggedEventData, monitor) => {
      const dropResult = monitor.getClientOffset()
      const dropTargetBounds = monitor.getTargetId()
      
      if (!dropResult) return

      // ドロップゾーンの要素を取得
      const dropZoneElement = document.querySelector('[data-drop-zone="true"]')
      if (!dropZoneElement) return

      const rect = dropZoneElement.getBoundingClientRect()
      const relativeY = dropResult.y - rect.top

      // 新しい開始時間を計算
      const minutesFromStart = Math.round(relativeY * MINUTES_PER_PIXEL)
      const newStartTime = addMinutes(startOfDay(date), minutesFromStart)
      
      // イベントの長さを保持
      const duration = differenceInMinutes(item.endTime, item.startTime)
      const newEndTime = addMinutes(newStartTime, duration)

      onEventDrop(item.id, newStartTime, newEndTime)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  return (
    <div
      ref={drop}
      data-drop-zone="true"
      className={cn(
        "relative transition-colors",
        isOver && canDrop && "bg-blue-50 dark:bg-blue-950/20",
        className
      )}
    >
      {children}
    </div>
  )
}