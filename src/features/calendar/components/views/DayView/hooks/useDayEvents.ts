import { useMemo } from 'react'
import { isSameDay, isValid } from 'date-fns'
import type { CalendarEvent } from '@/features/events'
import type { UseDayEventsOptions, UseDayEventsReturn, EventPosition } from '../DayView.types'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
const EVENT_PADDING = 2 // イベント間のパディング
const MAX_COLUMNS = 2 // 最大同時イベント列数（2列に制限）
const MIN_EVENT_HEIGHT = 20 // 最小イベント高さ

export function useDayEvents({ date, events }: UseDayEventsOptions): UseDayEventsReturn {
  const { dayEvents, eventPositions, maxConcurrentEvents, skippedEventsCount } = useMemo(() => {
    let skippedCount = 0
    
    // 当日のイベントのみフィルター
    const filteredEvents = events.filter(event => {
      if (!event.startDate || !isValid(new Date(event.startDate))) {
        return false
      }
      
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })

    // イベントを開始時刻でソート
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const aStart = new Date(a.startDate!)
      const bStart = new Date(b.startDate!)
      return aStart.getTime() - bStart.getTime()
    })

    // イベントの位置を計算
    const positions: EventPosition[] = []
    const eventColumns: Array<{ endTime: number; column: number }> = []

    sortedEvents.forEach((event, index) => {
      const startDate = new Date(event.startDate!)
      const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000) // デフォルト1時間

      const startHour = startDate.getHours() + startDate.getMinutes() / 60
      const endHour = endDate.getHours() + endDate.getMinutes() / 60
      const duration = Math.max(endHour - startHour, 0.25) // 最小15分

      // 位置計算
      const top = startHour * HOUR_HEIGHT
      const height = Math.max(duration * HOUR_HEIGHT - EVENT_PADDING, MIN_EVENT_HEIGHT)
      
      // 重複する列を見つける
      const startTime = startDate.getTime()
      const endTime = endDate.getTime()
      
      // 使用可能な列を見つける（最大2列、重複回避）
      let column = 0
      let placed = false
      
      // 既存の列で使用可能なものを探す
      for (let i = 0; i < eventColumns.length && i < MAX_COLUMNS; i++) {
        if (eventColumns[i].endTime <= startTime) {
          // この列は使用可能
          column = i
          eventColumns[i] = { endTime, column: i }
          placed = true
          break
        }
      }
      
      // 使用可能な列がない場合、新しい列を作成
      if (!placed && eventColumns.length < MAX_COLUMNS) {
        column = eventColumns.length
        eventColumns.push({ endTime, column })
        placed = true
      }
      
      // それでも配置できない場合（3つ以上の重複）はスキップ
      if (!placed) {
        console.warn(`⚠️ Event "${event.title}" skipped: maximum 2 overlapping events allowed`)
        skippedCount++
        return // このイベントを配置せずにスキップ
      }

      // 同時実行イベント数を計算
      const concurrentEvents = eventColumns.filter(col => col.endTime > startTime).length
      const totalColumns = Math.min(concurrentEvents, MAX_COLUMNS)
      
      // 幅と左位置を計算（50%ずつでp-2相当のgap）
      let widthPercentage: number
      let leftPercentage: number
      
      if (totalColumns === 1) {
        // 1列の場合は全幅（マージンはEventBlock側で処理）
        widthPercentage = 100
        leftPercentage = 0
      } else {
        // 2列の場合は50%ずつ（マージンはEventBlock側で処理）
        widthPercentage = 100 / totalColumns
        leftPercentage = column * widthPercentage
      }

      positions.push({
        event,
        top,
        height,
        left: leftPercentage,
        width: widthPercentage,
        zIndex: 10 + index,
        column,
        totalColumns,
        opacity: totalColumns > 1 ? 0.95 : 1.0 // 重複時は少し透明度を下げて区別しやすく
      })
    })

    const maxConcurrent = Math.max(1, Math.min(eventColumns.length, MAX_COLUMNS))

    return {
      dayEvents: sortedEvents,
      eventPositions: positions,
      maxConcurrentEvents: maxConcurrent,
      skippedEventsCount: skippedCount
    }
  }, [date, events])

  return {
    dayEvents,
    eventPositions,
    maxConcurrentEvents,
    skippedEventsCount
  }
}