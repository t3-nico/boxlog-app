import { useMemo } from 'react'
import { format, isSameDay } from 'date-fns'
import type { 
  UseWeekEventsOptions, 
  UseWeekEventsReturn,
  WeekEventPosition 
} from '../WeekView.types'
import type { CalendarEvent } from '@/features/events'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
const DAY_COLUMN_WIDTH = 100 / 7 // 各日の列幅（%）

/**
 * 週ビューでのイベント位置計算専用フック
 * 
 * @description
 * - イベントの重なり検出
 * - 位置とサイズの計算
 * - 最大同時イベント数の算出
 */
export function useWeekEvents({
  weekDates,
  events = []
}: UseWeekEventsOptions): UseWeekEventsReturn {
  
  // イベントを日付ごとにグループ化
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    
    // 各日付のキーを初期化
    weekDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      grouped[dateKey] = []
    })
    
    // イベントを適切な日付に配置
    events.forEach(event => {
      if (!event.startDate) return
      
      const eventStart = event.startDate instanceof Date 
        ? event.startDate 
        : new Date(event.startDate)
      
      // 無効な日付は除外
      if (isNaN(eventStart.getTime())) return
      
      // 週の範囲内の日付を確認
      weekDates.forEach(date => {
        if (isSameDay(eventStart, date)) {
          const dateKey = format(date, 'yyyy-MM-dd')
          if (grouped[dateKey]) {
            grouped[dateKey].push(event)
          }
        }
      })
    })
    
    // 各日のイベントを時刻順にソート
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        const aTime = a.startDate ? a.startDate.getTime() : 0
        const bTime = b.startDate ? b.startDate.getTime() : 0
        return aTime - bTime
      })
    })
    
    return grouped
  }, [weekDates, events])
  
  // イベントの位置情報を計算
  const eventPositions = useMemo(() => {
    const positions: WeekEventPosition[] = []
    
    weekDates.forEach((date, dayIndex) => {
      const dateKey = format(date, 'yyyy-MM-dd')
      const dayEvents = eventsByDate[dateKey] || []
      
      // その日のイベントの重なりを検出
      const eventColumns = calculateEventColumns(dayEvents)
      
      dayEvents.forEach((event, eventIndex) => {
        if (!event.startDate) return
        
        // 時刻からピクセル位置を計算
        const startHour = event.startDate.getHours()
        const startMinute = event.startDate.getMinutes()
        const top = (startHour + startMinute / 60) * HOUR_HEIGHT
        
        // 終了時刻から高さを計算
        let height = HOUR_HEIGHT // デフォルト1時間
        if (event.endDate) {
          const endHour = event.endDate.getHours()
          const endMinute = event.endDate.getMinutes()
          const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)
          height = Math.max(20, duration * HOUR_HEIGHT) // 最小20px
        }
        
        // 重なりがある場合の列計算
        const columnInfo = eventColumns[eventIndex]
        const columnWidth = DAY_COLUMN_WIDTH / columnInfo.totalColumns
        const left = dayIndex * DAY_COLUMN_WIDTH + (columnInfo.column * columnWidth)
        const width = columnWidth * 0.95 // 少し余白を作る
        
        positions.push({
          event,
          dayIndex,
          top,
          height,
          left,
          width,
          zIndex: 20 + columnInfo.column,
          column: columnInfo.column,
          totalColumns: columnInfo.totalColumns
        })
      })
    })
    
    return positions
  }, [weekDates, eventsByDate])
  
  // 最大同時イベント数を計算
  const maxConcurrentEvents = useMemo(() => {
    let maxConcurrent = 0
    
    Object.values(eventsByDate).forEach(dayEvents => {
      if (dayEvents.length <= 1) return
      
      // 時間帯ごとの重なりを計算
      const timeSlots: { start: number; end: number }[] = []
      
      dayEvents.forEach(event => {
        if (!event.startDate) return
        
        const start = event.startDate.getHours() + event.startDate.getMinutes() / 60
        const end = event.endDate 
          ? event.endDate.getHours() + event.endDate.getMinutes() / 60
          : start + 1
        
        timeSlots.push({ start, end })
      })
      
      // 各時刻での重なり数を計算
      for (let hour = 0; hour < 24; hour += 0.25) {
        const concurrent = timeSlots.filter(slot => 
          hour >= slot.start && hour < slot.end
        ).length
        
        maxConcurrent = Math.max(maxConcurrent, concurrent)
      }
    })
    
    return maxConcurrent
  }, [eventsByDate])
  
  return {
    eventsByDate,
    eventPositions,
    maxConcurrentEvents
  }
}

/**
 * イベントの重なりを検出して列配置を計算
 */
function calculateEventColumns(events: CalendarEvent[]): Array<{ column: number; totalColumns: number }> {
  if (events.length === 0) return []
  
  // 時間順にソート済みと仮定
  const columns: Array<{ column: number; totalColumns: number }> = []
  const occupiedColumns: Array<{ end: number }> = []
  
  events.forEach(event => {
    if (!event.startDate) {
      columns.push({ column: 0, totalColumns: 1 })
      return
    }
    
    const start = event.startDate.getHours() + event.startDate.getMinutes() / 60
    const end = event.endDate 
      ? event.endDate.getHours() + event.endDate.getMinutes() / 60
      : start + 1
    
    // 利用可能な列を探す
    let columnIndex = 0
    while (columnIndex < occupiedColumns.length && occupiedColumns[columnIndex].end > start) {
      columnIndex++
    }
    
    // 列を占有
    if (columnIndex >= occupiedColumns.length) {
      occupiedColumns.push({ end })
    } else {
      occupiedColumns[columnIndex].end = end
    }
    
    columns.push({
      column: columnIndex,
      totalColumns: Math.max(occupiedColumns.length, 1)
    })
  })
  
  // すべてのイベントの totalColumns を統一
  const maxColumns = Math.max(...columns.map(col => col.totalColumns), 1)
  return columns.map(col => ({
    ...col,
    totalColumns: maxColumns
  }))
}