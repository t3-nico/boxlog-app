import type { 
  Event, 
  EventEntity, 
  CreateEventRequest, 
  UpdateEventRequest, 
  CalendarEvent 
} from '../types/events'

/**
 * Database Entity → Client Event への変換
 */
export function transformEventEntityToEvent(entity: EventEntity): Event {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description || undefined,
    startDate: entity.start_date ? new Date(entity.start_date) : undefined,
    endDate: entity.end_date ? new Date(entity.end_date) : undefined,
    type: entity.type,
    status: entity.status,
    priority: entity.priority || undefined,
    color: entity.color,
    isRecurring: entity.is_recurring || false,
    recurrenceRule: entity.recurrence_rule || undefined,
    parentEventId: entity.parent_event_id || undefined,
    items: entity.items || undefined,
    location: entity.location || undefined,
    url: entity.url || undefined,
    reminders: entity.reminders || undefined,
    tags: entity.event_tags?.map(et => ({
      id: et.tags.id,
      name: et.tags.name,
      color: et.tags.color,
      icon: et.tags.icon,
      parent_id: et.tags.parent_id
    })) || undefined,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
    deletedAt: entity.deleted_at ? new Date(entity.deleted_at) : undefined,
    isDeleted: entity.is_deleted || false
  }
}

/**
 * Client Event → Database Entity への変換
 */
export function transformEventToEventEntity(event: Event): Omit<EventEntity, 'created_at' | 'updated_at'> {
  return {
    id: event.id,
    title: event.title,
    description: event.description || null,
    start_date: event.startDate?.toISOString() || null,
    end_date: event.endDate?.toISOString() || null,
    type: event.type,
    status: event.status,
    priority: event.priority || null,
    color: event.color,
    is_recurring: event.isRecurring || false,
    recurrence_rule: event.recurrenceRule || null,
    parent_event_id: event.parentEventId || null,
    items: event.items || null,
    location: event.location || null,
    url: event.url || null,
    reminders: event.reminders || null,
    deleted_at: event.deletedAt?.toISOString() || null,
    is_deleted: event.isDeleted || false
  }
}

/**
 * CreateEventRequest → Database Insert用データへの変換
 */
export function transformCreateRequestToEntity(request: CreateEventRequest): Omit<EventEntity, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: request.title,
    description: request.description || null,
    start_date: request.startDate?.toISOString() || null,
    end_date: request.endDate?.toISOString() || null,
    type: request.type,
    status: request.status,
    priority: request.priority || null,
    color: request.color,
    is_recurring: request.isRecurring || false,
    recurrence_rule: request.recurrenceRule || null,
    parent_event_id: request.parentEventId || null,
    items: request.items || null,
    location: request.location || null,
    url: request.url || null,
    reminders: request.reminders || null,
    deleted_at: null,
    is_deleted: false
  }
}

/**
 * UpdateEventRequest → Database Update用データへの変換
 */
export function transformUpdateRequestToEntity(request: UpdateEventRequest): Partial<Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>> {
  const result: Partial<Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>> = {}

  // フィールドマッピング定義
  const fieldMappings: Array<{
    requestField: keyof UpdateEventRequest
    entityField: keyof Omit<EventEntity, 'id' | 'created_at' | 'updated_at'>
    transform?: (value: unknown) => unknown
  }> = [
    { requestField: 'title', entityField: 'title' },
    { requestField: 'description', entityField: 'description', transform: (v) => v || null },
    { requestField: 'startDate', entityField: 'start_date', transform: (v) => v?.toISOString() || null },
    { requestField: 'endDate', entityField: 'end_date', transform: (v) => v?.toISOString() || null },
    { requestField: 'type', entityField: 'type' },
    { requestField: 'status', entityField: 'status' },
    { requestField: 'priority', entityField: 'priority', transform: (v) => v || null },
    { requestField: 'color', entityField: 'color' },
    { requestField: 'isRecurring', entityField: 'is_recurring', transform: (v) => v || false },
    { requestField: 'recurrenceRule', entityField: 'recurrence_rule', transform: (v) => v || null },
    { requestField: 'parentEventId', entityField: 'parent_event_id', transform: (v) => v || null },
    { requestField: 'items', entityField: 'items', transform: (v) => v || null },
    { requestField: 'location', entityField: 'location', transform: (v) => v || null },
    { requestField: 'url', entityField: 'url', transform: (v) => v || null },
    { requestField: 'reminders', entityField: 'reminders', transform: (v) => v || null }
  ]

  // マッピングに従って変換
  fieldMappings.forEach(({ requestField, entityField, transform }) => {
    if (requestField in request && request[requestField] !== undefined) {
      const value = request[requestField]
      if (entityField in result || !result[entityField]) {
        result[entityField] = transform ? transform(value) : value
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
    duration: event.startDate && event.endDate 
      ? Math.floor((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60)) 
      : 0,
    isMultiDay: event.startDate && event.endDate 
      ? event.endDate.toDateString() !== event.startDate.toDateString()
      : false,
    isRecurring: event.isRecurring || false
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
    hour12: true 
  })
  
  if (!endDate) return startTime
  
  const endTime = endDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
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
    day: 'numeric' 
  })
  
  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return startDateStr
  }
  
  const endDateStr = endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
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
    // 終了日がない場合は、開始日が今日で未完了なら進行中とみなす
    const today = now.toDateString()
    const eventDate = event.startDate.toDateString()
    return today === eventDate && event.status !== 'completed'
  }
}