/**
 * イベント日付グループ化統一フック
 * 6箇所で重複していた80-90行のロジックを統合
 */

import { useMemo } from 'react'

import { isSameDay } from 'date-fns'

import type { CalendarEvent } from '../types/base.types'
import { 
  getDateKey, 
  isValidEvent
} from '../utils/dateHelpers'
import { 
  sortEventsByDateKeys,
  sortAgendaEventsByDateKeys 
} from '../utils/eventSorting'

export interface UseEventsByDateOptions {
  dates: Date[]
  events: CalendarEvent[]
  sortType?: 'standard' | 'agenda' // agenda = 終日イベント優先
}

export interface UseEventsByDateReturn {
  eventsByDate: Record<string, CalendarEvent[]>
  totalEvents: number
  hasEvents: boolean
}

/**
 * イベントを日付ごとにグループ化する統一フック
 * 
 * @description
 * 以前は各ビューで80-90行の重複ロジックがあったが、これで統一
 * - WeekView, TwoWeekView, ThreeDayView, AgendaView で共通使用
 * - マルチデイイベント対応
 * - 無効イベントの自動フィルタリング
 * - 時刻ソート（標準 or Agenda用）
 */
export function useEventsByDate({
  dates,
  events = [],
  sortType = 'standard'
}: UseEventsByDateOptions): UseEventsByDateReturn {
  
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    
    console.log('🔧 useEventsByDate: グループ化開始:', {
      datesCount: dates.length,
      eventsCount: events.length,
      sortType,
      sampleDates: dates.slice(0, 3).map(d => ({ date: d.toDateString(), key: getDateKey(d) })),
      sampleEvents: events.slice(0, 3).map(e => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate?.toISOString?.() || e.startDate,
        isValid: isValidEvent(e)
      }))
    })
    
    // Step 1: 各日付のキーを初期化
    dates.forEach(date => {
      const dateKey = getDateKey(date)
      grouped[dateKey] = []
    })
    
    
    // Step 2: イベントを適切な日付に配置 - useWeekEventsのロジックを参考に修正
    let processedCount = 0
    let skippedCount = 0
    
    events.forEach((event, index) => {
      if (!isValidEvent(event)) {
        skippedCount++
        return
      }
      
      // より柔軟な日付正規化
      const eventStart = event.startDate instanceof Date 
        ? event.startDate 
        : new Date(event.startDate)
      
      // 無効な日付は除外
      if (isNaN(eventStart.getTime())) {
        skippedCount++
        return
      }
      
      // マルチデイイベントの場合は複数日にまたがって表示
      if (event.isMultiDay && event.endDate) {
        const eventEnd = event.endDate instanceof Date 
          ? event.endDate 
          : new Date(event.endDate)
        
        if (!isNaN(eventEnd.getTime())) {
          let matchedDates = 0
          // 期間内の日付のみ処理
          dates.forEach(date => {
            if (date >= eventStart && date <= eventEnd) {
              const dateKey = getDateKey(date)
              if (grouped[dateKey]) {
                grouped[dateKey].push(event)
                matchedDates++
              }
            }
          })
          if (matchedDates > 0) {
            processedCount++
          }
          return
        }
      }
      
      // 単日イベントの場合 - WeekViewのuseWeekEventsと同じロジックを使用
      let matched = false
      dates.forEach(date => {
        if (isSameDay(eventStart, date)) {
          const dateKey = getDateKey(date)
          if (grouped[dateKey]) {
            grouped[dateKey].push(event)
            if (!matched) {
              matched = true
              processedCount++
            }
          }
        }
      })
      
    })
    
    
    // Step 3: 各日のイベントを適切にソート
    const sortedResult = sortType === 'agenda' 
      ? sortAgendaEventsByDateKeys(grouped) 
      : sortEventsByDateKeys(grouped)
    
    console.log('🔧 useEventsByDate: グループ化完了:', {
      processedCount,
      skippedCount,
      resultKeys: Object.keys(sortedResult),
      resultCounts: Object.entries(sortedResult).map(([key, events]) => ({ date: key, count: events.length })),
      nonEmptyDates: Object.entries(sortedResult).filter(([key, events]) => events.length > 0).map(([key, events]) => ({ 
        date: key, 
        count: events.length,
        eventTitles: events.map(e => e.title).slice(0, 2)
      }))
    })
    
    return sortedResult
  }, [dates, events, sortType])
  
  // 統計情報も提供
  const totalEvents = useMemo(() => {
    return Object.values(eventsByDate).reduce((total, dayEvents) => total + dayEvents.length, 0)
  }, [eventsByDate])
  
  const hasEvents = totalEvents > 0
  
  return {
    eventsByDate,
    totalEvents,
    hasEvents
  }
}