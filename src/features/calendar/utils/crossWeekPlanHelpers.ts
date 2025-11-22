// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
import { addDays, endOfDay, format, isSameDay, isSaturday, isSunday, isWithinInterval, startOfDay } from 'date-fns'

import { CalendarEvent } from '@/features/calendar/types/calendar.types'

export interface EventSegment extends CalendarEvent {
  originalEvent: CalendarEvent
  segmentStart: Date
  segmentEnd: Date
  isPartialSegment: boolean
  segmentType: 'start' | 'middle' | 'end' | 'full'
  originalDuration: number
}

/**
 * 週をまたぐイベントを週末表示設定に応じて分割する
 * @param events 元のイベントリスト
 * @param showWeekends 週末表示フラグ
 * @param weekStart 週の開始日
 * @returns 分割されたイベントセグメント
 */
export function splitCrossWeekEvents(events: CalendarEvent[], showWeekends: boolean, weekStart: Date): EventSegment[] {
  const segments: EventSegment[] = []

  events.forEach((event) => {
    if (!event.startDate || !event.endDate) {
      // 単発イベントはそのまま追加
      segments.push({
        ...event,
        originalEvent: event,
        segmentStart: event.startDate || new Date(),
        segmentEnd: event.endDate || event.startDate || new Date(),
        isPartialSegment: false,
        segmentType: 'full',
        originalDuration: event.duration || 60,
      })
      return
    }

    const eventStart = startOfDay(event.startDate)
    const eventEnd = endOfDay(event.endDate)

    // 単日イベントの場合
    if (isSameDay(eventStart, eventEnd)) {
      segments.push({
        ...event,
        originalEvent: event,
        segmentStart: event.startDate,
        segmentEnd: event.endDate,
        isPartialSegment: false,
        segmentType: 'full',
        originalDuration: event.duration || 60,
      })
      return
    }

    // 複数日イベントを分割
    const eventSegments = createEventSegments(event, showWeekends, weekStart)
    segments.push(...eventSegments)
  })

  return segments
}

/**
 * 複数日イベントを日毎のセグメントに分割
 */
function createEventSegments(event: CalendarEvent, showWeekends: boolean, _weekStart: Date): EventSegment[] {
  const segments: EventSegment[] = []

  if (!event.startDate || !event.endDate) return segments

  let currentDate = startOfDay(event.startDate)
  const endDate = startOfDay(event.endDate)
  const originalDuration = event.duration || 60

  let segmentIndex = 0
  const totalDays = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  while (currentDate <= endDate) {
    // 週末表示がOFFの場合、土日をスキップ
    if (!showWeekends && (isSaturday(currentDate) || isSunday(currentDate))) {
      currentDate = addDays(currentDate, 1)
      continue
    }

    const isFirstSegment = segmentIndex === 0
    const isLastSegment = isSameDay(currentDate, endDate)

    // セグメントの開始・終了時刻を計算
    const segmentStart = isFirstSegment
      ? event.startDate
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0)

    const segmentEnd = isLastSegment
      ? event.endDate
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59)

    // セグメントタイプを決定
    let segmentType: 'start' | 'middle' | 'end' | 'full'
    if (totalDays === 1) {
      segmentType = 'full'
    } else if (isFirstSegment) {
      segmentType = 'start'
    } else if (isLastSegment) {
      segmentType = 'end'
    } else {
      segmentType = 'middle'
    }

    // セグメントを作成
    segments.push({
      ...event,
      id: `${event.id}-segment-${format(currentDate, 'yyyy-MM-dd')}`,
      originalEvent: event,
      segmentStart,
      segmentEnd,
      startDate: segmentStart,
      endDate: segmentEnd,
      isPartialSegment: segmentType !== 'full',
      segmentType,
      originalDuration,
      // タイトルにセグメント情報を追加
      title: segmentType === 'full' ? event.title : `${event.title} ${getSegmentLabel(segmentType)}`,
      // 分割されたセグメントの継続時間を計算
      duration: Math.ceil((segmentEnd.getTime() - segmentStart.getTime()) / (1000 * 60)),
    })

    currentDate = addDays(currentDate, 1)
    segmentIndex++
  }

  return segments
}

/**
 * セグメントタイプに応じたラベルを取得
 */
function getSegmentLabel(segmentType: 'start' | 'middle' | 'end' | 'full'): string {
  switch (segmentType) {
    case 'start':
      return '(開始)'
    case 'middle':
      return '(継続)'
    case 'end':
      return '(終了)'
    case 'full':
    default:
      return ''
  }
}

/**
 * 週末に含まれるイベントをフィルタリング
 */
export function filterWeekendEvents(events: CalendarEvent[], dateRange: { start: Date; end: Date }): CalendarEvent[] {
  return events.filter((event) => {
    if (!event.startDate) return false

    const eventDate = event.startDate
    const isWeekend = isSaturday(eventDate) || isSunday(eventDate)

    return isWeekend && isWithinInterval(eventDate, dateRange)
  })
}

/**
 * 金曜から月曜にまたがるイベントを検出
 */
export function detectFridayToMondayEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => {
    if (!event.startDate || !event.endDate) return false

    const startDay = event.startDate.getDay() // 0=Sunday, 5=Friday
    const endDay = event.endDate.getDay() // 1=Monday

    return startDay === 5 && endDay === 1 // Friday to Monday
  })
}
