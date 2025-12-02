/**
 * イベントリポジトリ
 */

import type { LocalEvent, StoredEvent } from './types'
import { StorageQuotaExceededError } from './types'
import {
  acquireLock,
  checkStorageQuota,
  dateToString,
  generateId,
  releaseLock,
  safeJsonParse,
  safeJsonStringify,
  stringToDate,
} from './utils'

const EVENTS_KEY = 'boxlog_events'

// 変換関数
function eventToStored(event: LocalEvent): StoredEvent {
  return {
    ...event,
    startDate: dateToString(event.startDate),
    endDate: event.endDate ? dateToString(event.endDate) : undefined,
    createdAt: dateToString(event.createdAt),
    updatedAt: dateToString(event.updatedAt),
    deletedAt: event.deletedAt ? dateToString(event.deletedAt) : undefined,
  }
}

function storedToEvent(stored: StoredEvent): LocalEvent {
  return {
    ...stored,
    startDate: stringToDate(stored.startDate),
    endDate: stored.endDate ? stringToDate(stored.endDate) : undefined,
    createdAt: stringToDate(stored.createdAt),
    updatedAt: stringToDate(stored.updatedAt),
    deletedAt: stored.deletedAt ? stringToDate(stored.deletedAt) : undefined,
  }
}

// CRUD操作
export async function createEvent(event: Omit<LocalEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocalEvent> {
  await acquireLock(EVENTS_KEY)

  try {
    const now = new Date()
    const newEvent: LocalEvent = {
      ...event,
      id: generateId('event'),
      createdAt: now,
      updatedAt: now,
    }

    const events = await getEvents(true)
    events.push(newEvent)

    const storedEvents = events.map((e) => eventToStored(e))
    const dataStr = safeJsonStringify(storedEvents)

    if (!checkStorageQuota(dataStr.length)) {
      throw new StorageQuotaExceededError()
    }

    localStorage.setItem(EVENTS_KEY, dataStr)
    return newEvent
  } finally {
    releaseLock(EVENTS_KEY)
  }
}

export async function updateEvent(id: string, updates: Partial<LocalEvent>): Promise<LocalEvent | null> {
  await acquireLock(EVENTS_KEY)

  try {
    const events = await getEvents(true)
    const eventIndex = events.findIndex((e) => e.id === id)

    if (eventIndex === -1) {
      return null
    }

    const currentEvent = events[eventIndex]
    if (!currentEvent) {
      return null
    }

    const updatedEvent: LocalEvent = {
      ...currentEvent,
      ...updates,
      id,
      updatedAt: new Date(),
    }

    events[eventIndex] = updatedEvent

    const storedEvents = events.map((e) => eventToStored(e))
    localStorage.setItem(EVENTS_KEY, safeJsonStringify(storedEvents))

    return updatedEvent
  } finally {
    releaseLock(EVENTS_KEY)
  }
}

export async function deleteEvent(id: string, soft = true): Promise<boolean> {
  await acquireLock(EVENTS_KEY)

  try {
    const events = await getEvents(true)
    const eventIndex = events.findIndex((e) => e.id === id)

    if (eventIndex === -1) {
      return false
    }

    if (soft) {
      const event = events[eventIndex]
      if (event) {
        event.deletedAt = new Date()
      }
    } else {
      events.splice(eventIndex, 1)
    }

    const storedEvents = events.map((e) => eventToStored(e))
    localStorage.setItem(EVENTS_KEY, safeJsonStringify(storedEvents))

    return true
  } finally {
    releaseLock(EVENTS_KEY)
  }
}

export async function getEvent(id: string): Promise<LocalEvent | null> {
  const events = await getEvents(true)
  return events.find((e) => e.id === id) || null
}

export async function getEvents(includeDeleted = false): Promise<LocalEvent[]> {
  const data = localStorage.getItem(EVENTS_KEY)
  if (!data) return []

  const storedEvents: StoredEvent[] = safeJsonParse(data, [])
  const events = storedEvents.map((e) => storedToEvent(e))

  if (includeDeleted) {
    return events
  }

  return events.filter((e) => !e.deletedAt)
}

export async function getEventsByDateRange(start: Date, end: Date): Promise<LocalEvent[]> {
  const events = await getEvents()

  return events.filter((event) => {
    const eventStart = event.startDate
    const eventEnd = event.endDate || event.startDate

    return (
      (eventStart >= start && eventStart <= end) ||
      (eventEnd >= start && eventEnd <= end) ||
      (eventStart <= start && eventEnd >= end)
    )
  })
}

// 初期化
export function initializeEvents(): void {
  if (!localStorage.getItem(EVENTS_KEY)) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify([]))
  }
}

// 検証
export function validateEvents(events: LocalEvent[]): string[] {
  const errors: string[] = []

  for (const event of events) {
    if (!event.id || !event.title || !event.startDate) {
      errors.push(`イベント ${event.id} に必須フィールドが不足しています`)
    }
    if (event.endDate && event.endDate < event.startDate) {
      errors.push(`イベント ${event.id} の終了日が開始日より前です`)
    }
  }

  return errors
}

// エクスポート用
export { EVENTS_KEY, eventToStored, storedToEvent }
