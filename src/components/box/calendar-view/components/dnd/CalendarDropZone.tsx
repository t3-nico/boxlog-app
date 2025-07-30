'use client'

import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { addMinutes, startOfDay, differenceInMinutes } from 'date-fns'
import { DRAG_TYPE, DraggedEventData } from './DraggableEvent'
import { HOUR_HEIGHT } from '../../constants/grid-constants'
import { utcToUserTimezone, userTimezoneToUtc } from '@/utils/timezone'
import type { CalendarEvent } from '@/types/events'

interface CalendarDropZoneProps {
  date: Date
  dayIndex: number
  onEventUpdate?: (event: CalendarEvent) => void
  children: React.ReactNode
  className?: string
}

const MINUTES_PER_PIXEL = 60 / HOUR_HEIGHT

export function CalendarDropZone({
  date,
  dayIndex,
  onEventUpdate,
  children,
  className
}: CalendarDropZoneProps) {
  const dropRef = useRef<HTMLDivElement>(null)
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DRAG_TYPE.EVENT,
    drop: (item: DraggedEventData, monitor) => {
      console.log('🎯 ドロップ受信:', { event: item.event.title, dayIndex, hasCallback: !!onEventUpdate })
      const dropResult = monitor.getClientOffset()
      if (!dropResult || !dropRef.current) {
        console.log('❌ ドロップ失敗: dropResult または dropRef がない')
        return
      }
      
      if (!onEventUpdate) {
        console.log('❌ onEventUpdate コールバックが存在しません')
        return
      }

      const rect = dropRef.current.getBoundingClientRect()
      const scrollTop = dropRef.current.closest('.full-day-scroll')?.scrollTop || 0
      const relativeY = dropResult.y - rect.top + scrollTop

      console.log('📍 ドロップ位置情報:', {
        clientY: dropResult.y,
        rectTop: rect.top,
        scrollTop,
        relativeY
      })

      // 新しい開始時間を計算（15分単位にスナップ）
      const minutesFromStart = Math.round(relativeY * MINUTES_PER_PIXEL)
      const snappedMinutes = Math.round(minutesFromStart / 15) * 15
      const newStartTime = addMinutes(startOfDay(date), snappedMinutes)
      
      // イベントの長さを保持
      if (!item.event.startDate || !item.event.endDate) {
        console.log('❌ イベントの開始時刻または終了時刻が存在しません')
        return
      }
      
      const userStartDate = utcToUserTimezone(item.event.startDate)
      const userEndDate = utcToUserTimezone(item.event.endDate)
      const duration = differenceInMinutes(userEndDate, userStartDate)
      const newEndTime = addMinutes(newStartTime, duration)

      // 既にローカル時間で計算されているので、UTC変換は不要
      const updatedEvent: CalendarEvent = {
        ...item.event,
        startDate: newStartTime,
        endDate: newEndTime
      }

      console.log('🎯 イベントドロップ詳細:', {
        originalStartUTC: item.event.startDate.toISOString(),
        originalStartLocal: userStartDate.toISOString(),
        newStartLocal: newStartTime.toISOString(),
        newEndLocal: newEndTime.toISOString(),
        dayIndex: item.dayIndex,
        newDayIndex: dayIndex,
        minutesFromStart,
        snappedMinutes,
        duration,
        dateUsed: date.toISOString()
      })

      try {
        onEventUpdate(updatedEvent)
        console.log('✅ onEventUpdate 呼び出し成功')
      } catch (error) {
        console.error('❌ onEventUpdate 呼び出しエラー:', error)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  drop(dropRef)

  return (
    <div
      ref={dropRef}
      className={cn(
        "relative flex-1",
        className
      )}
    >
      {children}
    </div>
  )
}