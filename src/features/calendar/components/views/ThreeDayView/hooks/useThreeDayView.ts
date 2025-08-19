import { useMemo, useCallback, useRef } from 'react'
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
  onEventUpdate
}: UseThreeDayViewOptions): UseThreeDayViewReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // 3日間の日付を生成（centerDateを中心に前後1日）
  const threeDayDates = useMemo(() => {
    // centerDateを正規化（時刻をリセット）
    const center = new Date(centerDate)
    center.setHours(0, 0, 0, 0)
    
    // 前日、中央日、翌日を生成
    const yesterday = subDays(center, 1)
    const tomorrow = addDays(center, 1)
    
    return [yesterday, center, tomorrow]
  }, [centerDate])
  
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
  
  // 現在時刻にスクロール
  const scrollToNow = useCallback(() => {
    if (!scrollContainerRef.current || !isCurrentDay) return
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    
    // 1時間 = 72px として計算
    const HOUR_HEIGHT = 72
    const scrollTop = Math.max(0, (currentHour + currentMinutes / 60 - 2) * HOUR_HEIGHT)
    
    scrollContainerRef.current.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
  }, [isCurrentDay])
  
  return {
    threeDayDates,
    eventsByDate,
    centerIndex,
    todayIndex,
    scrollToNow,
    isCurrentDay
  }
}