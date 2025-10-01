/**
 * Event Processing Web Worker
 * 重い計算処理をメインスレッドから分離してUIをブロックしない
 */

import type { CalendarEvent } from '@/features/events'

// ワーカーメッセージの型定義
interface ProcessEventsPayload {
  events: CalendarEvent[]
  options?: Record<string, unknown>
}

interface CalculateOverlapsPayload {
  events: CalendarEvent[]
  dateRange: { start: Date; end: Date }
}

interface GenerateRecurringPayload {
  event: CalendarEvent
  pattern: RecurrencePattern
  dateRange: { start: Date; end: Date }
}

interface SearchEventsPayload {
  events: CalendarEvent[]
  query: string
  options?: Record<string, unknown>
}

interface OptimizeLayoutPayload {
  events: CalendarEvent[]
  containerWidth: number
}

type WorkerMessagePayload =
  | ProcessEventsPayload
  | CalculateOverlapsPayload
  | GenerateRecurringPayload
  | SearchEventsPayload
  | OptimizeLayoutPayload

interface WorkerMessage {
  id: string
  type: 'PROCESS_EVENTS' | 'CALCULATE_OVERLAPS' | 'GENERATE_RECURRING' | 'SEARCH_EVENTS' | 'OPTIMIZE_LAYOUT'
  payload: WorkerMessagePayload
}

interface WorkerResponse {
  id: string
  type: string
  result?: unknown
  error?: string
  performance?: {
    duration: number
    memoryUsed: number
  }
}

// 繰り返しイベントのパターン
interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
  count?: number
  byWeekDay?: number[]
  byMonthDay?: number[]
}

// イベント重複計算の結果
interface OverlapResult {
  eventId: string
  overlaps: {
    eventId: string
    overlapDuration: number
    overlapPercentage: number
  }[]
}

// レイアウト最適化の結果
interface LayoutOptimization {
  eventId: string
  column: number
  width: number
  left: number
}

// メインスレッドからのメッセージ処理
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { id, type, payload } = e.data
  const startTime = performance.now()

  try {
    let result: unknown

    switch (type) {
      case 'PROCESS_EVENTS': {
        const p = payload as ProcessEventsPayload
        result = processEvents(p.events, p.options)
        break
      }

      case 'CALCULATE_OVERLAPS': {
        const p = payload as CalculateOverlapsPayload
        result = calculateEventOverlaps(p.events, p.dateRange)
        break
      }

      case 'GENERATE_RECURRING': {
        const p = payload as GenerateRecurringPayload
        result = generateRecurringEvents(p.event, p.pattern, p.dateRange)
        break
      }

      case 'SEARCH_EVENTS': {
        const p = payload as SearchEventsPayload
        result = searchEvents(p.events, p.query, p.options)
        break
      }

      case 'OPTIMIZE_LAYOUT': {
        const p = payload as OptimizeLayoutPayload
        result = optimizeEventLayout(p.events, p.containerWidth)
        break
      }
      
      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    const endTime = performance.now()
    const response: WorkerResponse = {
      id,
      type,
      result,
      performance: {
        duration: endTime - startTime,
        memoryUsed: getMemoryUsage()
      }
    }

    self.postMessage(response)
  } catch (error) {
    const endTime = performance.now()
    const response: WorkerResponse = {
      id,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        duration: endTime - startTime,
        memoryUsed: getMemoryUsage()
      }
    }

    self.postMessage(response)
  }
}

/**
 * イベントの前処理（正規化、ソート、重複除去など）
 */
function processEvents(events: CalendarEvent[], options: Record<string, unknown> = {}) {
  // 大量データを効率的に処理
  const batchSize = 1000
  const processedEvents: CalendarEvent[] = []
  
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize)
    
    // バッチごとに処理
    const processed = batch
      .filter(event => event.startDate && event.title) // 必須フィールドチェック
      .map(event => normalizeEvent(event))
      .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())
    
    processedEvents.push(...processed)
    
    // 進行状況の報告（オプション）
    if (options.onProgress) {
      const progress = Math.min(100, ((i + batchSize) / events.length) * 100)
      self.postMessage({
        id: 'progress',
        type: 'PROGRESS',
        result: { progress }
      })
    }
  }

  // 重複除去
  const uniqueEvents = removeDuplicateEvents(processedEvents)
  
  return {
    events: uniqueEvents,
    totalProcessed: events.length,
    uniqueCount: uniqueEvents.length,
    duplicatesRemoved: events.length - uniqueEvents.length
  }
}

/**
 * イベントの正規化
 */
function normalizeEvent(event: CalendarEvent): CalendarEvent {
  const normalized: CalendarEvent = {
    ...event,
    title: event.title.trim(),
    color: event.color || '#3b82f6',
    tags: event.tags || []
  }

  if (event.startDate) {
    normalized.startDate = new Date(event.startDate)
  }
  if (event.endDate) {
    normalized.endDate = new Date(event.endDate)
  }

  return normalized
}

/**
 * 重複イベントの除去
 */
function removeDuplicateEvents(events: CalendarEvent[]): CalendarEvent[] {
  const seen = new Set<string>()
  const unique: CalendarEvent[] = []

  for (const event of events) {
    const key = `${event.title}-${event.startDate?.getTime()}-${event.endDate?.getTime()}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(event)
    }
  }

  return unique
}

/**
 * イベントの重複計算
 */
function calculateEventOverlaps(events: CalendarEvent[], dateRange: { start: Date, end: Date }): OverlapResult[] {
  const results: OverlapResult[] = []
  const relevantEvents = events.filter(event => 
    event.startDate && 
    event.startDate >= dateRange.start && 
    event.startDate <= dateRange.end
  )

  for (let i = 0; i < relevantEvents.length; i++) {
    const event = relevantEvents[i]
    if (!event || !event.startDate || !event.endDate) continue

    const overlaps: OverlapResult['overlaps'] = []

    for (let j = i + 1; j < relevantEvents.length; j++) {
      const otherEvent = relevantEvents[j]
      if (!otherEvent || !otherEvent.startDate || !otherEvent.endDate) continue

      const overlap = calculateTimeOverlap(
        event.startDate, event.endDate,
        otherEvent.startDate, otherEvent.endDate
      )

      if (overlap.duration > 0) {
        overlaps.push({
          eventId: otherEvent.id,
          overlapDuration: overlap.duration,
          overlapPercentage: overlap.percentage
        })
      }
    }

    if (overlaps.length > 0) {
      results.push({
        eventId: event.id,
        overlaps
      })
    }
  }

  return results
}

/**
 * 時間の重複計算
 */
function calculateTimeOverlap(
  start1: Date, end1: Date,
  start2: Date, end2: Date
): { duration: number, percentage: number } {
  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()))
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()))
  
  if (overlapStart >= overlapEnd) {
    return { duration: 0, percentage: 0 }
  }

  const overlapDuration = overlapEnd.getTime() - overlapStart.getTime()
  const event1Duration = end1.getTime() - start1.getTime()
  const percentage = (overlapDuration / event1Duration) * 100

  return { duration: overlapDuration, percentage }
}

/**
 * 繰り返しイベントの生成
 */
function generateRecurringEvents(
  baseEvent: CalendarEvent, 
  pattern: RecurrencePattern, 
  dateRange: { start: Date, end: Date }
): CalendarEvent[] {
  if (!baseEvent.startDate || !baseEvent.endDate) return []

  const events: CalendarEvent[] = []
  const eventDuration = baseEvent.endDate.getTime() - baseEvent.startDate.getTime()
  
  let currentDate = new Date(baseEvent.startDate)
  let count = 0
  const maxCount = pattern.count || 1000 // 安全なデフォルト

  while (currentDate <= dateRange.end && count < maxCount) {
    if (currentDate >= dateRange.start) {
      const newEvent: CalendarEvent = {
        ...baseEvent,
        id: `${baseEvent.id}_${count}`,
        startDate: new Date(currentDate),
        endDate: new Date(currentDate.getTime() + eventDuration),
        parentEventId: baseEvent.id
      }
      events.push(newEvent)
    }

    // 次の日付を計算
    currentDate = getNextRecurrenceDate(currentDate, pattern)
    count++

    if (pattern.endDate && currentDate > pattern.endDate) {
      break
    }
  }

  return events
}

/**
 * 次の繰り返し日付を計算
 */
function getNextRecurrenceDate(currentDate: Date, pattern: RecurrencePattern): Date {
  const nextDate = new Date(currentDate)

  switch (pattern.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + pattern.interval)
      break
    
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * pattern.interval))
      break
    
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + pattern.interval)
      break
    
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + pattern.interval)
      break
  }

  return nextDate
}

/**
 * イベント検索
 */
function searchEvents(
  events: CalendarEvent[], 
  query: string, 
  options: { caseSensitive?: boolean, fields?: string[] } = {}
): CalendarEvent[] {
  const normalizedQuery = options.caseSensitive ? query : query.toLowerCase()
  const fields = options.fields || ['title', 'description', 'location']

  return events.filter(event => {
    return fields.some(field => {
      const value = event[field as keyof CalendarEvent] as string
      if (!value) return false
      
      const normalizedValue = options.caseSensitive ? value : value.toLowerCase()
      return normalizedValue.includes(normalizedQuery)
    })
  })
}

/**
 * イベントレイアウトの最適化
 */
function optimizeEventLayout(events: CalendarEvent[], containerWidth: number): LayoutOptimization[] {
  // 同時間帯のイベントをグループ化
  const timeGroups = groupEventsByTime(events)
  const layouts: LayoutOptimization[] = []

  for (const group of timeGroups) {
    const columnCount = group.length
    const columnWidth = containerWidth / columnCount
    
    group.forEach((event, index) => {
      layouts.push({
        eventId: event.id,
        column: index,
        width: columnWidth - 4, // マージン考慮
        left: index * columnWidth + 2
      })
    })
  }

  return layouts
}

/**
 * 時間帯でイベントをグループ化
 */
function groupEventsByTime(events: CalendarEvent[]): CalendarEvent[][] {
  const groups: CalendarEvent[][] = []
  const sortedEvents = events
    .filter(e => e.startDate && e.endDate)
    .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

  for (const event of sortedEvents) {
    // 重複する既存グループを探す
    const overlappingGroup = groups.find(group =>
      group.some(groupEvent => eventsOverlap(event, groupEvent))
    )

    if (overlappingGroup) {
      overlappingGroup.push(event)
    } else {
      groups.push([event])
    }
  }

  return groups
}

/**
 * イベントの重複チェック
 */
function eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  if (!event1.startDate || !event1.endDate || !event2.startDate || !event2.endDate) {
    return false
  }

  return event1.startDate < event2.endDate && event2.startDate < event1.endDate
}

/**
 * メモリ使用量の取得（概算）
 */
function getMemoryUsage(): number {
  // Web Worker環境では正確なメモリ使用量の取得が困難
  // 概算値を返す
  if ('memory' in performance) {
    return (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize
  }
  return 0
}

// エラーハンドリング
self.onerror = function(message, _source, _lineno, _colno, error) {
  self.postMessage({
    id: 'error',
    type: 'ERROR',
    error: error?.message || String(message)
  })
}

// 未処理の Promise エラーをキャッチ
self.addEventListener('unhandledrejection', function(event) {
  self.postMessage({
    id: 'error',
    type: 'UNHANDLED_REJECTION',
    error: event.reason
  })
})