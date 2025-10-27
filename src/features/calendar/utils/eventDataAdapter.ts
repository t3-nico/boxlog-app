// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
/**
 * イベントデータ変換ユーティリティ
 * EventStore形式 ↔ CalendarView形式の相互変換
 */

import type { Event } from '@/features/calendar/types/calendar.types'

import type { TimedEvent } from '../components/views/shared/types/event.types'

/**
 * EventStore形式のイベントをCalendarView形式に変換
 */
export function eventToTimedEvent(event: Event): TimedEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    color: event.color,
    start: event.startDate || new Date(),
    end: event.endDate || new Date(),
    isReadOnly: event.status === 'completed' || event.status === 'cancelled',
  }
}

/**
 * 複数のEventStore形式イベントをCalendarView形式に変換
 */
export function eventsToTimedEvents(events: Event[]): TimedEvent[] {
  return events
    .filter((event) => !event.isDeleted) // 削除済みイベントを除外
    .map(eventToTimedEvent)
}

/**
 * CalendarView形式のイベントをEventStore形式に変換（部分的）
 */
export function timedEventToEventUpdate(timedEvent: TimedEvent): Partial<Event> {
  return {
    id: timedEvent.id,
    title: timedEvent.title,
    description: timedEvent.description,
    startDate: timedEvent.start,
    endDate: timedEvent.end,
    color: timedEvent.color,
  }
}

/**
 * カレンダービューで使用するための安全な変換
 * undefinedやnullの場合のフォールバック付き
 */
export function safeEventToTimedEvent(event: Partial<Event>): TimedEvent | null {
  if (!event.id || !event.title) {
    return null
  }

  const now = new Date()
  const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000) // 1時間後

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    color: event.color || '#3b82f6',
    start: event.startDate || now,
    end: event.endDate || defaultEnd,
    isReadOnly: event.status === 'completed' || event.status === 'cancelled',
  }
}

/**
 * イベントリストの安全な変換（nullを除外）
 */
export function safeEventsToTimedEvents(events: (Event | Partial<Event>)[]): TimedEvent[] {
  return events.map(safeEventToTimedEvent).filter((event): event is TimedEvent => event !== null)
}
