import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import { HOUR_HEIGHT } from '../../constants/grid.constants'
import { formatTimeRange } from '../../utils/dateHelpers'

import type { DragDataRef } from '../types'

/**
 * プレビュー時間を計算する
 */
export function calculatePreviewTime(
  events: CalendarPlan[],
  draggedEventId: string | null,
  originalDateIndex: number | undefined,
  eventDuration: number | undefined,
  hour: number,
  minute: number,
  targetDateIndex: number,
  date: Date,
  viewMode: string,
  displayDates: Date[] | undefined
): { previewStartTime: Date; previewEndTime: Date } {
  const event = events.find((e) => e.id === draggedEventId)
  let durationMs = 60 * 60 * 1000

  if (event?.startDate && event?.endDate) {
    durationMs = event.endDate.getTime() - event.startDate.getTime()
  } else if (eventDuration) {
    durationMs = (eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
  }

  let targetDate = date
  if (viewMode !== 'day' && displayDates && targetDateIndex in displayDates && displayDates[targetDateIndex]) {
    targetDate = displayDates[targetDateIndex]

    if (targetDateIndex !== originalDateIndex) {
      console.log('🎯 プレビュー日付計算（非連続対応）:', {
        targetDateIndex,
        originalDateIndex,
        targetDate: targetDate.toDateString(),
        originalDate:
          originalDateIndex !== undefined && displayDates[originalDateIndex]
            ? displayDates[originalDateIndex]?.toDateString()
            : undefined,
      })
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = date
  }

  const previewStartTime = new Date(targetDate)
  previewStartTime.setHours(hour, minute, 0, 0)
  const previewEndTime = new Date(previewStartTime.getTime() + durationMs)

  return { previewStartTime, previewEndTime }
}

/**
 * ターゲット日付を計算する
 */
export function calculateTargetDate(
  targetDateIndex: number,
  date: Date,
  viewMode: string,
  displayDates: Date[] | undefined,
  dragDataRef: DragDataRef | null
): Date {
  let targetDate = date

  if (viewMode !== 'day' && displayDates && displayDates[targetDateIndex]) {
    targetDate = displayDates[targetDateIndex]
    console.log('🎯 ドロップ時のターゲット日付決定（非連続対応）:', {
      targetDateIndex,
      targetDate: targetDate.toDateString(),
      originalDateIndex: dragDataRef?.originalDateIndex,
      originalDate:
        dragDataRef?.originalDateIndex !== undefined
          ? displayDates[dragDataRef.originalDateIndex]?.toDateString?.()
          : undefined,
      displayDatesLength: displayDates.length,
      isNonConsecutive: displayDates.length < 7,
      allDisplayDates: displayDates.map((d) => d.toDateString()),
    })
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = date
    console.log('⚠️ 無効な日付のためデフォルト使用:', targetDate.toDateString())
  }

  return targetDate
}

/**
 * 新しい時刻を計算する
 */
export function calculateNewTime(
  newTop: number,
  targetDateIndex: number,
  date: Date,
  viewMode: string,
  displayDates: Date[] | undefined,
  dragDataRef: DragDataRef | null
): Date {
  const hourDecimal = newTop / HOUR_HEIGHT
  const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)))
  const minute = Math.round(Math.max(0, ((hourDecimal - hour) * 60) / 15)) * 15

  const targetDate = calculateTargetDate(targetDateIndex, date, viewMode, displayDates, dragDataRef)

  const newStartTime = new Date(targetDate)
  newStartTime.setHours(hour, minute, 0, 0)

  return newStartTime
}

/**
 * プラン期間を計算する
 */
export function calculateEventDuration(
  events: CalendarPlan[],
  eventId: string,
  dragDataRef: DragDataRef | null
): { event: CalendarPlan | undefined; durationMs: number } {
  const event = events.find((e) => e.id === eventId)
  let durationMs = 60 * 60 * 1000

  if (event?.startDate && event?.endDate) {
    durationMs = event.endDate.getTime() - event.startDate.getTime()
  } else if (dragDataRef?.eventDuration) {
    durationMs = (dragDataRef.eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
  }

  return { event, durationMs }
}

/**
 * 時間表示を更新する
 */
export function updateTimeDisplay(
  dragElement: HTMLElement | null,
  previewStartTime: Date,
  previewEndTime: Date
): void {
  if (!dragElement) return

  const timeElement = dragElement.querySelector('.event-time')
  if (timeElement) {
    const formattedTimeRange = formatTimeRange(previewStartTime, previewEndTime, '24h')
    timeElement.textContent = formattedTimeRange

    console.log('🕐 ドラッグ要素時間更新:', {
      formattedTimeRange,
      start: previewStartTime.toLocaleTimeString(),
      end: previewEndTime.toLocaleTimeString(),
    })
  }
}
