import { useMemo } from 'react'
import { 
  addDays, 
  subDays, 
  isToday, 
  isSameDay, 
  format 
} from 'date-fns'
import { ja } from 'date-fns/locale'
import type { 
  UseThreeDayViewOptions, 
  UseThreeDayViewReturn 
} from '../ThreeDayView.types'
import type { CalendarEvent } from '@/features/events'

/**
 * ThreeDayView専用のロジックを管理するフック
 * 
 * @description
 * - centerDateの前後1日を含む3日間を生成
 * - [yesterday, today, tomorrow] の配列
 * - モバイル表示に最適化
 * - イベントを日付ごとにグループ化
 */
export function useThreeDayView({
  centerDate,
  events = [],
  onEventUpdate,
  showWeekends = true
}: UseThreeDayViewOptions & { showWeekends?: boolean }): UseThreeDayViewReturn {
  
  // 3日間の日付を生成（centerDateを中心に前後1日）
  const threeDayDates = useMemo(() => {
    // centerDateを正規化（時刻をリセット）
    const center = new Date(centerDate)
    center.setHours(0, 0, 0, 0)
    
    if (showWeekends) {
      // 週末表示ON: 従来通りの連続3日間
      const yesterday = subDays(center, 1)
      const tomorrow = addDays(center, 1)
      return [yesterday, center, tomorrow]
    } else {
      // 週末表示OFF: 平日のみ3日間
      const dates: Date[] = []
      let currentDate = new Date(center)
      
      // 中央の日付から開始して、平日を前後に収集
      dates.push(new Date(currentDate))
      
      // 前の平日を1日分収集
      let prevDate = new Date(currentDate)
      let prevCount = 0
      while (prevCount < 1) {
        prevDate = subDays(prevDate, 1)
        if (prevDate.getDay() !== 0 && prevDate.getDay() !== 6) { // 平日のみ
          dates.unshift(new Date(prevDate))
          prevCount++
        }
      }
      
      // 次の平日を1日分収集
      let nextDate = new Date(currentDate)
      let nextCount = 0
      while (nextCount < 1) {
        nextDate = addDays(nextDate, 1)
        if (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) { // 平日のみ
          dates.push(new Date(nextDate))
          nextCount++
        }
      }
      
      return dates
    }
  }, [centerDate, showWeekends])
  
  // 中央の日付のインデックス（常に1）
  const centerIndex = 1
  
  // 今日が3日間の中のどこにあるかを計算（-1 if not in range）
  const todayIndex = useMemo(() => {
    const today = new Date()
    return threeDayDates.findIndex(date => isSameDay(date, today))
  }, [threeDayDates])
  
  // 中央の日付が今日かどうか
  const isCurrentDay = useMemo(() => {
    return isToday(threeDayDates[centerIndex])
  }, [threeDayDates, centerIndex])
  
  // イベントを日付ごとにグループ化
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    
    // 各日付のキーを初期化
    threeDayDates.forEach(date => {
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
      
      // マルチデイイベントの場合は複数日にまたがって表示
      if (event.isMultiDay && event.endDate) {
        const eventEnd = event.endDate instanceof Date 
          ? event.endDate 
          : new Date(event.endDate)
        
        if (!isNaN(eventEnd.getTime())) {
          // 3日間の範囲内の日付のみ処理
          threeDayDates.forEach(date => {
            if (date >= eventStart && date <= eventEnd) {
              const dateKey = format(date, 'yyyy-MM-dd')
              if (grouped[dateKey]) {
                grouped[dateKey].push(event)
              }
            }
          })
          return
        }
      }
      
      // 単日イベントの場合
      const dateKey = format(eventStart, 'yyyy-MM-dd')
      if (grouped[dateKey]) {
        grouped[dateKey].push(event)
      }
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
  }, [threeDayDates, events])
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  
  return {
    threeDayDates,
    eventsByDate,
    centerIndex,
    todayIndex,
    isCurrentDay
  }
}