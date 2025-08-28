import { useMemo, useCallback, useRef } from 'react'
import { 
  eachDayOfInterval, 
  isAfter,
  isBefore
} from 'date-fns'
import { 
  useEventsByDate,
  useCurrentPeriod,
  getDateKey
} from '../../shared'
import type { 
  UseAgendaViewOptions, 
  UseAgendaViewReturn 
} from '../AgendaView.types'

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
  
  // Phase 3統合フック代替: 表示期間の日付配列を生成
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
  
  // Phase 3統合フック: イベント日付グループ化（50-60行が1行に！）
  const { eventsByDate } = useEventsByDate({
    dates: agendaDates,
    events: filteredEvents,
    sortType: 'agenda' // 終日イベント優先ソート
  })
  
  // 全イベント（グループ化しない場合）
  const allEvents = useMemo(() => {
    if (groupByDate) return []
    
    return filteredEvents.sort((a, b) => {
      const aTime = a.startDate ? a.startDate.getTime() : 0
      const bTime = b.startDate ? b.startDate.getTime() : 0
      return aTime - bTime
    })
  }, [filteredEvents, groupByDate])
  
  // Phase 3統合フック: 現在期間判定とtodayIndex計算
  const { isCurrentPeriod, todayIndex } = useCurrentPeriod({
    dates: agendaDates,
    periodType: 'agenda'
  })
  
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
    const todayElement = scrollContainerRef.current.querySelector(`[data-date="${getDateKey(agendaDates[todayIndex])}"]`)
    
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