import type { CalendarEvent, CreateEventRequest, Event, EventEntity, UpdateEventRequest } from '../types/events'

/**
 * Database Entity → Client Event への変換
 */
export function transformEventEntityToEvent(entity: EventEntity): Event {
  const result: Event = {
    id: entity.id,
    title: entity.title,
    type: 'event',
    status: entity.status,
    color: entity.color,
    isRecurring: entity.is_recurring ?? false,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
    isDeleted: false,
  }

  if (entity.description !== undefined) result.description = entity.description
  if (entity.planned_start) result.startDate = new Date(entity.planned_start)
  if (entity.planned_end) result.endDate = new Date(entity.planned_end)
  if (entity.priority !== undefined) result.priority = entity.priority
  if (entity.recurrence_rule !== undefined) result.recurrenceRule = entity.recurrence_rule
  if (entity.parent_event_id !== undefined) result.parentEventId = entity.parent_event_id
  if (entity.items !== undefined) result.items = entity.items
  if (entity.location !== undefined) result.location = entity.location
  if (entity.url !== undefined) result.url = entity.url
  if (entity.reminders !== undefined) result.reminders = entity.reminders
  if (entity.event_tags) {
    result.tags = entity.event_tags.map((et) => ({
      id: et.tags.id,
      name: et.tags.name,
      color: et.tags.color,
      ...(et.tags.icon !== undefined && { icon: et.tags.icon }),
      ...(et.tags.parent_id !== undefined && { parent_id: et.tags.parent_id }),
    }))
  }

  return result
}

/**
 * Client Event → Database Entity への変換
 */
export function transformEventToEventEntity(event: Event): Partial<Omit<EventEntity, 'created_at' | 'updated_at'>> {
  return {
    id: event.id,
    user_id: '', // user_id is required in EventEntity, but not in Event
    title: event.title,
    ...(event.description !== undefined && { description: event.description }),
    ...(event.startDate !== undefined && { planned_start: event.startDate.toISOString() }),
    ...(event.endDate !== undefined && { planned_end: event.endDate.toISOString() }),
    status: event.status,
    ...(event.priority !== undefined && { priority: event.priority }),
    color: event.color,
    ...(event.isRecurring !== undefined && { is_recurring: event.isRecurring }),
    ...(event.recurrenceRule !== undefined && { recurrence_rule: event.recurrenceRule }),
    ...(event.parentEventId !== undefined && { parent_event_id: event.parentEventId }),
    ...(event.items !== undefined && { items: event.items }),
    ...(event.location !== undefined && { location: event.location }),
    ...(event.url !== undefined && { url: event.url }),
    ...(event.reminders !== undefined && { reminders: event.reminders }),
  }
}

/**
 * CreateEventRequest → Database Insert用データへの変換
 */
export function transformCreateRequestToEntity(
  request: CreateEventRequest
): Partial<Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>> {
  const result: Partial<Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>> = {
    user_id: '', // user_id is required in EventEntity
    title: request.title,
    status: request.status ?? 'inbox',
    color: request.color ?? '',
  }

  if (request.description !== undefined) result.description = request.description
  if (request.startDate) result.planned_start = request.startDate.toISOString()
  if (request.endDate) result.planned_end = request.endDate.toISOString()
  if (request.priority !== undefined) result.priority = request.priority
  if (request.isRecurring !== undefined) result.is_recurring = request.isRecurring
  if (request.recurrenceRule !== undefined) result.recurrence_rule = request.recurrenceRule
  if (request.parentEventId !== undefined) result.parent_event_id = request.parentEventId
  if (request.items !== undefined) result.items = request.items
  if (request.location !== undefined) result.location = request.location
  if (request.url !== undefined) result.url = request.url
  if (request.reminders !== undefined) result.reminders = request.reminders

  return result
}

/**
 * UpdateEventRequest → Database Update用データへの変換
 */
export function transformUpdateRequestToEntity(
  request: UpdateEventRequest
): Partial<Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>> {
  const result: Partial<Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>> = {}

  // フィールドマッピング定義
  const fieldMappings: Array<{
    requestField: keyof UpdateEventRequest
    entityField: keyof Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>
    transform?: (value: unknown) => unknown
  }> = [
    { requestField: 'title', entityField: 'title' },
    { requestField: 'description', entityField: 'description' },
    {
      requestField: 'startDate',
      entityField: 'planned_start',
      transform: (v) => (v as Date | undefined)?.toISOString(),
    },
    { requestField: 'endDate', entityField: 'planned_end', transform: (v) => (v as Date | undefined)?.toISOString() },
    { requestField: 'status', entityField: 'status' },
    { requestField: 'priority', entityField: 'priority' },
    { requestField: 'color', entityField: 'color' },
    { requestField: 'isRecurring', entityField: 'is_recurring' },
    { requestField: 'recurrenceRule', entityField: 'recurrence_rule' },
    { requestField: 'parentEventId', entityField: 'parent_event_id' },
    { requestField: 'items', entityField: 'items' },
    { requestField: 'location', entityField: 'location' },
    { requestField: 'url', entityField: 'url' },
    { requestField: 'reminders', entityField: 'reminders' },
  ]

  // マッピングに従って変換
  fieldMappings.forEach(({ requestField, entityField, transform }) => {
    if (requestField in request && request[requestField] !== undefined) {
      const value = request[requestField]
      if (entityField in result || !result[entityField]) {
        ;(result as Record<string, unknown>)[entityField] = transform ? transform(value) : value
      }
    }
  })

  return result
}

/**
 * Event → CalendarEvent への変換（カレンダービュー用）
 */
export function transformEventToCalendarEvent(event: Event): CalendarEvent {
  const baseCalendarEvent: CalendarEvent = {
    ...event,
    displayStartDate: event.startDate || new Date(),
    displayEndDate: event.endDate || new Date(),
    duration:
      event.startDate && event.endDate
        ? Math.floor((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))
        : 0,
    isMultiDay:
      event.startDate && event.endDate ? event.endDate.toDateString() !== event.startDate.toDateString() : false,
    isRecurring: event.isRecurring || false,
  }

  return baseCalendarEvent
}

/**
 * 複数のEventEntity配列をEvent配列に変換
 */
export function transformEventEntities(entities: EventEntity[]): Event[] {
  return entities.map(transformEventEntityToEvent)
}

/**
 * 複数のEventをCalendarEvent配列に変換
 */
export function transformEventsToCalendarEvents(events: Event[]): CalendarEvent[] {
  return events.map(transformEventToCalendarEvent)
}

/**
 * 日付文字列の正規化（タイムゾーンを考慮）
 */
export function normalizeDateString(dateString: string | null): Date | undefined {
  if (!dateString) return undefined

  try {
    return new Date(dateString)
  } catch {
    return undefined
  }
}

/**
 * イベントの時間表示用フォーマット
 */
export function formatEventTime(startDate: Date | undefined, endDate: Date | undefined, isAllDay?: boolean): string {
  if (isAllDay) return 'All day'

  if (!startDate) return ''

  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (!endDate) return startTime

  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${startTime} - ${endTime}`
}

/**
 * イベントの日付表示用フォーマット
 */
export function formatEventDate(startDate: Date | undefined, endDate: Date | undefined): string {
  if (!startDate) return ''

  const startDateStr = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return startDateStr
  }

  const endDateStr = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return `${startDateStr} - ${endDateStr}`
}

/**
 * イベントの期間計算（分単位）
 */
export function calculateEventDuration(startDate: Date | undefined, endDate: Date | undefined): number {
  if (!startDate || !endDate) return 0
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60))
}

/**
 * イベントが現在進行中かどうか判定
 */
export function isEventInProgress(event: Event): boolean {
  const now = new Date()

  if (!event.startDate) return false
  if (event.status === 'completed' || event.status === 'cancelled') return false

  if (event.endDate) {
    return now >= event.startDate && now <= event.endDate
  } else {
    // 終了日がない場合は、開始日が今日なら進行中とみなす
    const today = now.toDateString()
    const eventDate = event.startDate.toDateString()
    return today === eventDate
  }
}
