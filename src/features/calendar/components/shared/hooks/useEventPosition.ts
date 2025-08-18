'use client'

import { useMemo } from 'react'
import type { TimeEvent, PositionedEvent, EventPosition } from '../types'

interface EventPositionConfig {
  hourHeight?: number
  dayWidth?: number
  startHour?: number
  columnIndex?: number // 複数日表示時の列番号
  totalColumns?: number // 総列数
}

/**
 * イベント配置計算フック
 * イベントの画面上での位置とサイズを計算
 */
export function useEventPosition(
  events: TimeEvent[],
  config: EventPositionConfig = {}
): PositionedEvent[] {
  const {
    hourHeight = 60,
    dayWidth = 100,
    startHour = 0,
    columnIndex = 0,
    totalColumns = 1
  } = config

  const positionedEvents = useMemo((): PositionedEvent[] => {
    return events.map(event => {
      // 開始時刻の計算
      const startHour = event.startTime.getHours()
      const startMinute = event.startTime.getMinutes()
      const startDecimal = startHour + startMinute / 60
      
      // 終了時刻の計算
      const endHour = event.endTime.getHours()
      const endMinute = event.endTime.getMinutes()
      const endDecimal = endHour + endMinute / 60
      
      // 位置計算
      const top = (startDecimal - config.startHour!) * hourHeight
      const height = Math.max(20, (endDecimal - startDecimal) * hourHeight) // 最小高さ20px
      
      // 幅と左位置（複数列の場合）
      const columnWidth = dayWidth / totalColumns
      const left = columnIndex * columnWidth
      const width = columnWidth - 2 // 境界線のための余白

      const position: EventPosition = {
        top,
        height,
        left,
        width
      }

      return {
        ...event,
        position
      }
    })
  }, [events, hourHeight, dayWidth, startHour, columnIndex, totalColumns])

  return positionedEvents
}

/**
 * 重複するイベントの位置調整フック
 * 同じ時間帯にある複数のイベントを重ならないように配置
 */
export function useOverlapAdjustedEvents(
  positionedEvents: PositionedEvent[]
): PositionedEvent[] {
  return useMemo(() => {
    const adjustedEvents = [...positionedEvents]
    
    // 時間でソート
    adjustedEvents.sort((a, b) => a.position.top - b.position.top)
    
    // 重複検出と位置調整
    for (let i = 0; i < adjustedEvents.length; i++) {
      const currentEvent = adjustedEvents[i]
      const overlappingEvents = []
      
      // 重複するイベントを見つける
      for (let j = 0; j < adjustedEvents.length; j++) {
        if (i === j) continue
        const otherEvent = adjustedEvents[j]
        
        // 時間が重複するかチェック
        const currentEnd = currentEvent.position.top + currentEvent.position.height
        const otherEnd = otherEvent.position.top + otherEvent.position.height
        
        if (
          currentEvent.position.top < otherEnd &&
          currentEnd > otherEvent.position.top
        ) {
          overlappingEvents.push(j)
        }
      }
      
      // 重複がある場合、幅を調整
      if (overlappingEvents.length > 0) {
        const totalOverlapping = overlappingEvents.length + 1
        const newWidth = currentEvent.position.width / totalOverlapping
        
        currentEvent.position.width = newWidth
        
        overlappingEvents.forEach((index, order) => {
          adjustedEvents[index].position.width = newWidth
          adjustedEvents[index].position.left += newWidth * (order + 1)
        })
      }
    }
    
    return adjustedEvents
  }, [positionedEvents])
}