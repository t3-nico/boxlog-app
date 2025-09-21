'use client'

import React, { useRef, useState, useEffect } from 'react'

import { addMinutes, differenceInMinutes, format } from 'date-fns'
import { useDrop } from 'react-dnd'

import { HOUR_HEIGHT } from '@/features/calendar/constants/calendar-constants'
import type { CalendarEvent } from '@/features/events'
import { utcToUserTimezone } from '@/features/settings/utils/timezone'
import { cn } from '@/lib/utils'

import { DRAG_TYPE, DraggedEventData } from './DraggableEvent'


// スナップ間隔のオプション
export type SnapInterval = 5 | 10 | 15 | 30

interface CalendarDropZoneProps {
  date: Date
  dayIndex: number
  onEventUpdate?: (event: CalendarEvent) => void
  snapInterval?: SnapInterval // スナップ間隔（デフォルト15分）
  showDropIndicator?: boolean // ドロップインジケーターを表示するか
  children: React.ReactNode
  className?: string
}

const MINUTES_PER_PIXEL = 60 / HOUR_HEIGHT

export const CalendarDropZone = ({
  date,
  dayIndex: _dayIndex,
  onEventUpdate,
  snapInterval = 15,
  showDropIndicator = true,
  children,
  className
}: CalendarDropZoneProps) => {
  const dropRef = useRef<HTMLDivElement>(null)
  const [dropPosition, setDropPosition] = useState<number | null>(null)
  const [hoveredTime, setHoveredTime] = useState<string | null>(null)
  
  // ドロップ位置のリアルタイム更新
  const [{ isOver, canDrop, item }, drop] = useDrop({
    accept: DRAG_TYPE.EVENT,
    hover: (draggedItem: DraggedEventData, monitor) => {
      if (!dropRef.current || !showDropIndicator) return
      
      const hoverClientOffset = monitor.getClientOffset()
      if (!hoverClientOffset) return
      
      const rect = dropRef.current.getBoundingClientRect()
      const scrollContainer = dropRef.current.closest('[data-slot="scroll-area-viewport"]') ||
                             dropRef.current.closest('.overflow-y-auto') ||
                             dropRef.current.closest('.overflow-auto') ||
                             dropRef.current.parentElement
      const scrollTop = scrollContainer?.scrollTop || 0
      
      // マウスオフセットを考慮したカード上部の位置
      const mouseOffsetY = draggedItem.mouseOffsetY || 0
      const cardTopY = hoverClientOffset.y - mouseOffsetY
      const relativeY = cardTopY - rect.top + scrollTop
      
      // スナップ位置を計算
      const minutesFromStart = Math.round(relativeY * MINUTES_PER_PIXEL)
      const snappedMinutes = Math.round(minutesFromStart / snapInterval) * snapInterval
      const snappedY = (snappedMinutes / MINUTES_PER_PIXEL)
      
      setDropPosition(snappedY)
      
      // 時刻表示を更新
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      const hoverTime = addMinutes(targetDate, snappedMinutes)
      setHoveredTime(format(hoverTime, 'HH:mm'))
    },
    drop: (item: DraggedEventData, monitor) => {
      const dropResult = monitor.getClientOffset()
      if (!dropResult || !dropRef.current) {
        setDropPosition(null)
        setHoveredTime(null)
        return
      }
      
      if (!onEventUpdate) {
        setDropPosition(null)
        setHoveredTime(null)
        return
      }

      const rect = dropRef.current.getBoundingClientRect()
      const scrollContainer = dropRef.current.closest('[data-slot="scroll-area-viewport"]') ||
                             dropRef.current.closest('.overflow-y-auto') ||
                             dropRef.current.closest('.overflow-auto') ||
                             dropRef.current.parentElement
      const scrollTop = scrollContainer?.scrollTop || 0
      
      const mouseOffsetY = item.mouseOffsetY || 0
      const cardTopY = dropResult.y - mouseOffsetY
      const relativeY = cardTopY - rect.top + scrollTop

      // 新しい開始時間を計算（設定可能な間隔でスナップ）
      const minutesFromStart = Math.round(relativeY * MINUTES_PER_PIXEL)
      const snappedMinutes = Math.round(minutesFromStart / snapInterval) * snapInterval
      
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      const newStartTime = addMinutes(targetDate, snappedMinutes)
      
      if (!item.event.startDate || !item.event.endDate) {
        setDropPosition(null)
        setHoveredTime(null)
        return
      }
      
      const userStartDate = utcToUserTimezone(item.event.startDate)
      const userEndDate = utcToUserTimezone(item.event.endDate)
      const duration = differenceInMinutes(userEndDate, userStartDate)
      const newEndTime = addMinutes(newStartTime, duration)

      const updatedEvent: CalendarEvent = {
        ...item.event,
        startDate: newStartTime,
        endDate: newEndTime
      }

      try {
        onEventUpdate(updatedEvent)
        // ドロップ完了後にインジケーターをクリア
        setTimeout(() => {
          setDropPosition(null)
          setHoveredTime(null)
        }, 100)
      } catch (error) {
        console.error('❌ onEventUpdate 呼び出しエラー:', error)
        setDropPosition(null)
        setHoveredTime(null)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.getItem() as DraggedEventData | null
    })
  })

  // hover終了時にインジケーターをクリア
  useEffect(() => {
    if (!isOver) {
      setDropPosition(null)
      setHoveredTime(null)
    }
  }, [isOver])

  drop(dropRef)

  return (
    <div
      ref={dropRef}
      className={cn(
        "relative flex-1 transition-colors duration-200",
        isOver && canDrop && "bg-primary/5",
        className
      )}
    >
      {children}
      
      {/* ドロップ位置インジケーター */}
      {showDropIndicator && isOver && canDrop && dropPosition !== null && (
        <>
          <div
            className="absolute left-0 right-0 h-[2px] bg-primary z-50 pointer-events-none"
            style={{ 
              top: `${dropPosition}px`,
              boxShadow: '0 0 8px rgba(var(--primary), 0.5)'
            }}
          >
            {/* 時刻ラベル */}
            {hoveredTime != null && (
              <div className="absolute -left-12 -top-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                {hoveredTime}
              </div>
            )}
          </div>
          
          {/* ドロッププレビューアウトライン */}
          {item != null && (
            <div
              className="absolute left-0 right-0 border-2 border-primary/30 rounded-md pointer-events-none z-40"
              style={{
                top: `${dropPosition}px`,
                height: `${item.height || 40}px`,
                backgroundColor: 'rgba(var(--primary), 0.05)'
              }}
            />
          )}
        </>
      )}
    </div>
  )
}