'use client'

import { useMemo } from 'react'

import { isSameDay, isValid } from 'date-fns'

import type { CalendarEvent } from '../../types/event.types'
import { HOUR_HEIGHT } from '../constants/grid.constants'

import { useEventLayoutCalculator } from './useEventLayoutCalculator'

const EVENT_PADDING = 2 // イベント間のパディング
const MIN_EVENT_HEIGHT = 20 // 最小イベント高さ

export interface EventPositionInfo {
  event: CalendarEvent
  top: number // px
  height: number // px
  left: number // %
  width: number // %
  zIndex: number
  column: number
  totalColumns: number
  opacity?: number
}

interface UseEventPositioningOptions {
  date: Date
  events: any[] // CalendarEvent型を拡張したイベント配列
  viewType?: 'day' | 'week' | 'month'
}

/**
 * カレンダービュー共通のイベント位置計算フック
 * 全てのビュー（Day, Week, ThreeDay等）で利用可能
 */
export function useEventPositioning({ 
  date, 
  events = [], // デフォルト値を空配列に設定
  viewType = 'day' 
}: UseEventPositioningOptions) {
  
  // 当日のイベントのみフィルター（Day/Week共通）
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.startDate || !isValid(new Date(event.startDate))) {
        return false
      }
      
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })
  }, [date, events])

  // CalendarEventをuseEventLayoutCalculatorで期待される形式に変換
  const convertedEvents = useMemo(() => {
    return filteredEvents.map(event => ({
      ...event,
      start: event.startDate!,
      end: event.endDate || new Date(new Date(event.startDate!).getTime() + 60 * 60 * 1000)
    }))
  }, [filteredEvents])

  // 新しいレイアウト計算システムを使用
  const eventLayouts = useEventLayoutCalculator(convertedEvents, { notifyConflicts: true })

  // レイアウト情報をEventPositionInfoに変換
  const eventPositions = useMemo(() => {
    return eventLayouts.map((layout, index) => {
      const startDate = new Date(layout.event.start)
      const endDate = new Date(layout.event.end)

      const startHour = startDate.getHours() + startDate.getMinutes() / 60
      const endHour = endDate.getHours() + endDate.getMinutes() / 60
      const duration = Math.max(endHour - startHour, 0.25) // 最小15分

      // 位置計算
      const top = startHour * HOUR_HEIGHT
      const height = Math.max(duration * HOUR_HEIGHT - EVENT_PADDING, MIN_EVENT_HEIGHT)

      return {
        event: layout.event,
        top,
        height,
        left: layout.left,
        width: layout.width,
        zIndex: 10 + index,
        column: layout.column,
        totalColumns: layout.totalColumns,
        opacity: layout.totalColumns > 1 ? 0.95 : 1.0
      }
    })
  }, [eventLayouts])

  const maxConcurrentEvents = useMemo(() => {
    return Math.max(1, ...eventLayouts.map(layout => layout.totalColumns))
  }, [eventLayouts])

  return {
    events: filteredEvents,
    eventPositions,
    maxConcurrentEvents
  }
}