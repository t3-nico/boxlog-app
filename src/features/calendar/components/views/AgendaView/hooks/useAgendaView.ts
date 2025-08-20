import { useMemo, useCallback, useRef } from 'react'
import { 
  addDays, 
  eachDayOfInterval, 
  isToday, 
  isSameDay, 
  format,
  isAfter,
  isBefore
} from 'date-fns'
import { ja } from 'date-fns/locale'
import type { 
  UseAgendaViewOptions, 
  UseAgendaViewReturn 
} from '../AgendaView.types'
import type { CalendarEvent } from '@/features/events'

/**
 * AgendaView専用のロジックを管理するフック
 * 
 * @description
 * - startDateからendDateまでの期間のイベントを日付順で管理
 * - Googleカレンダーのアジェンダビューのような構造
 * - 日付ごとにグループ化
 * - 縦スクロールのリスト形式
 */
export function useAgendaView({
  startDate,
  endDate,
  events = [],
  groupByDate = true
}: UseAgendaViewOptions): UseAgendaViewReturn {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // 表示期間の日付配列を生成
  const agendaDates = useMemo(() => {
    if (!groupByDate) return []
    
    return eachDayOfInterval({
      start: startDate,
      end: endDate
    })
  }, [startDate, endDate, groupByDate])
  
  // 期間内のイベントをフィルタリング
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.startDate) return false
      
      const eventStart = event.startDate instanceof Date 
        ? event.startDate 
        : new Date(event.startDate)
      
      // 無効な日付は除外
      if (isNaN(eventStart.getTime())) return false
      
      // マルチデイイベントの場合は期間との重複をチェック
      if (event.isMultiDay && event.endDate) {
        const eventEnd = event.endDate instanceof Date 
          ? event.endDate 
          : new Date(event.endDate)
        
        if (!isNaN(eventEnd.getTime())) {
          // イベント期間と表示期間が重複するかチェック
          return !(eventEnd < startDate || eventStart > endDate)
        }
      }
      
      // 単日イベントの場合は表示期間内かチェック
      return !isBefore(eventStart, startDate) && !isAfter(eventStart, endDate)
    })
  }, [events, startDate, endDate])
  
  // イベントを日付ごとにグループ化
  const eventsByDate = useMemo(() => {
    if (!groupByDate) return {}
    
    const grouped: Record<string, CalendarEvent[]> = {}
    
    // 各日付のキーを初期化
    agendaDates.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      grouped[dateKey] = []
    })
    
    // フィルタリングされたイベントを適切な日付に配置
    filteredEvents.forEach(event => {
      if (!event.startDate) return
      
      const eventStart = event.startDate instanceof Date 
        ? event.startDate 
        : new Date(event.startDate)
      
      // マルチデイイベントの場合は複数日にまたがって表示
      if (event.isMultiDay && event.endDate) {
        const eventEnd = event.endDate instanceof Date 
          ? event.endDate 
          : new Date(event.endDate)
        
        if (!isNaN(eventEnd.getTime())) {
          // 表示期間内の日付のみ処理
          agendaDates.forEach(date => {
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
        // 終日イベントを最初に
        const aIsAllDay = !a.startDate || a.startDate.getHours() === 0 && a.startDate.getMinutes() === 0
        const bIsAllDay = !b.startDate || b.startDate.getHours() === 0 && b.startDate.getMinutes() === 0
        
        if (aIsAllDay && !bIsAllDay) return -1
        if (!aIsAllDay && bIsAllDay) return 1
        
        // 時刻順にソート
        const aTime = a.startDate ? a.startDate.getTime() : 0
        const bTime = b.startDate ? b.startDate.getTime() : 0
        return aTime - bTime
      })
    })
    
    return grouped
  }, [agendaDates, filteredEvents, groupByDate])
  
  // 全イベント（グループ化しない場合）
  const allEvents = useMemo(() => {
    if (groupByDate) return []
    
    return filteredEvents.sort((a, b) => {
      const aTime = a.startDate ? a.startDate.getTime() : 0
      const bTime = b.startDate ? b.startDate.getTime() : 0
      return aTime - bTime
    })
  }, [filteredEvents, groupByDate])
  
  // 今日が期間内のどこにあるかを計算（-1 if not in range）
  const todayIndex = useMemo(() => {
    const today = new Date()
    return agendaDates.findIndex(date => isSameDay(date, today))
  }, [agendaDates])
  
  // 現在の期間内かどうか
  const isCurrentPeriod = useMemo(() => {
    const today = new Date()
    return !isBefore(today, startDate) && !isAfter(today, endDate)
  }, [startDate, endDate])
  
  // 総イベント数
  const totalEvents = useMemo(() => {
    return groupByDate 
      ? Object.values(eventsByDate).reduce((sum, events) => sum + events.length, 0)
      : allEvents.length
  }, [eventsByDate, allEvents, groupByDate])
  
  // イベントが存在するかどうか
  const hasEvents = totalEvents > 0
  
  // 今日の日付にスクロール
  const scrollToToday = useCallback(() => {
    if (!scrollContainerRef.current || todayIndex === -1) return
    
    // 今日の日付グループ要素を探してスクロール
    const todayElement = scrollContainerRef.current.querySelector(`[data-date="${format(agendaDates[todayIndex], 'yyyy-MM-dd')}"]`)
    
    if (todayElement) {
      todayElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [todayIndex, agendaDates])
  
  return {
    agendaDates,
    eventsByDate,
    allEvents,
    todayIndex,
    scrollToToday,
    isCurrentPeriod,
    totalEvents,
    hasEvents
  }
}