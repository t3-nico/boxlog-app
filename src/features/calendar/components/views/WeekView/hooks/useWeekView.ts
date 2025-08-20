import { useMemo } from 'react'
import { 
  startOfWeek, 
  addDays, 
  isToday, 
  isSameWeek, 
  format,
  isSameDay 
} from 'date-fns'
import { ja } from 'date-fns/locale'
import type { 
  UseWeekViewOptions, 
  UseWeekViewReturn 
} from '../WeekView.types'
import type { CalendarEvent } from '@/features/events'

/**
 * WeekView専用のロジックを管理するフック
 * 
 * @description
 * - 週の7日間の日付生成
 * - イベントを日付ごとにグループ化
 * - 今日の日付判定
 * - 現在時刻へのスクロール機能
 */
export function useWeekView({
  startDate,
  events = [],
  weekStartsOn = 0, // 0: 日曜始まり, 1: 月曜始まり
  onEventUpdate
}: UseWeekViewOptions): UseWeekViewReturn {
  
  // 週の開始日を計算（日曜または月曜）
  const weekStart = useMemo(() => {
    return startOfWeek(startDate, { weekStartsOn })
  }, [startDate, weekStartsOn])
  
  // 週の7日間の日付を生成
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => 
      addDays(weekStart, index)
    )
  }, [weekStart])
  
  // 今日が週の何番目にあるかを計算（-1 if not in week）
  const todayIndex = useMemo(() => {
    const today = new Date()
    return weekDates.findIndex(date => isSameDay(date, today))
  }, [weekDates])
  
  // 現在の週かどうかを判定
  const isCurrentWeek = useMemo(() => {
    return isSameWeek(new Date(), startDate, { weekStartsOn })
  }, [startDate, weekStartsOn])
  
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
      
      // マルチデイイベントの場合は複数日にまたがって表示
      if (event.isMultiDay && event.endDate) {
        const eventEnd = event.endDate instanceof Date 
          ? event.endDate 
          : new Date(event.endDate)
        
        if (!isNaN(eventEnd.getTime())) {
          // 週の範囲内の日付のみ処理
          weekDates.forEach(date => {
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
  }, [weekDates, events])
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  
  return {
    weekDates,
    eventsByDate,
    todayIndex,
    isCurrentWeek
  }
}