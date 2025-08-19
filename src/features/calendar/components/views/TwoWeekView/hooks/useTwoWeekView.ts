import { useMemo } from 'react'
import { 
  addDays, 
  startOfWeek, 
  isToday, 
  isSameDay, 
  format,
  isSameWeek
} from 'date-fns'
import { ja } from 'date-fns/locale'
import type { 
  UseTwoWeekViewOptions, 
  UseTwoWeekViewReturn 
} from '../TwoWeekView.types'
import type { CalendarEvent } from '@/features/events'

/**
 * TwoWeekView専用のロジックを管理するフック
 * 
 * @description
 * - startDateから連続する14日間を生成
 * - 2週間の予定を俯瞰
 * - 横スクロール対応
 * - デスクトップ向け最適化
 */
export function useTwoWeekView({
  startDate,
  events = [],
  onEventUpdate
}: UseTwoWeekViewOptions): UseTwoWeekViewReturn {
  
  // 2週間（14日）の日付を生成
  const twoWeekDates = useMemo(() => {
    // startDateを週の開始日に正規化（日曜始まり）
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 })
    
    // 14日分の日付を生成
    return Array.from({ length: 14 }, (_, index) => 
      addDays(weekStart, index)
    )
  }, [startDate])
  
  // 今日が14日間の中のどこにあるかを計算（-1 if not in range）
  const todayIndex = useMemo(() => {
    const today = new Date()
    return twoWeekDates.findIndex(date => isSameDay(date, today))
  }, [twoWeekDates])
  
  // 今日がある週のインデックス（0: 第1週, 1: 第2週）
  const currentWeekIndex = useMemo(() => {
    if (todayIndex === -1) return -1
    return Math.floor(todayIndex / 7)
  }, [todayIndex])
  
  // 現在の2週間かどうか
  const isCurrentTwoWeeks = useMemo(() => {
    const today = new Date()
    return twoWeekDates.some(date => isSameDay(date, today))
  }, [twoWeekDates])
  
  // イベントを日付ごとにグループ化
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    
    // 各日付のキーを初期化
    twoWeekDates.forEach(date => {
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
          // 2週間の範囲内の日付のみ処理
          twoWeekDates.forEach(date => {
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
  }, [twoWeekDates, events])
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  
  return {
    twoWeekDates,
    eventsByDate,
    todayIndex,
    currentWeekIndex,
    isCurrentTwoWeeks
  }
}