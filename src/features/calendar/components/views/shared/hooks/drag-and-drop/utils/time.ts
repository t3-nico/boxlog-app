import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { convertFromTimezone, formatInTimezone } from '@/lib/date/timezone';

import { formatTimeRange } from '@/lib/date';
import { HOUR_HEIGHT } from '../../../constants/grid.constants';

import type { DragDataRef } from '../types';

/**
 * プレビュー時間を計算する
 */
export function calculatePreviewTime(
  events: CalendarPlan[],
  draggedEventId: string | null,
  _originalDateIndex: number | undefined,
  eventDuration: number | undefined,
  hour: number,
  minute: number,
  targetDateIndex: number,
  date: Date,
  viewMode: string,
  displayDates: Date[] | undefined,
  hourHeight: number = HOUR_HEIGHT,
  timezone?: string,
): { previewStartTime: Date; previewEndTime: Date } {
  const event = events.find((e) => e.id === draggedEventId);
  let durationMs = 60 * 60 * 1000;

  if (event?.startDate && event?.endDate) {
    durationMs = event.endDate.getTime() - event.startDate.getTime();
  } else if (eventDuration) {
    durationMs = (eventDuration / hourHeight) * 60 * 60 * 1000;
  }

  let targetDate = date;
  if (
    viewMode !== 'day' &&
    displayDates &&
    targetDateIndex in displayDates &&
    displayDates[targetDateIndex]
  ) {
    targetDate = displayDates[targetDateIndex];
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = date;
  }

  const localStart = new Date(targetDate);
  localStart.setHours(hour, minute, 0, 0);
  const previewStartTime = timezone ? convertFromTimezone(localStart, timezone) : localStart;
  const previewEndTime = new Date(previewStartTime.getTime() + durationMs);

  return { previewStartTime, previewEndTime };
}

/**
 * ターゲット日付を計算する
 */
export function calculateTargetDate(
  targetDateIndex: number,
  date: Date,
  viewMode: string,
  displayDates: Date[] | undefined,
  _dragDataRef: DragDataRef | null,
): Date {
  let targetDate = date;

  if (viewMode !== 'day' && displayDates && displayDates[targetDateIndex]) {
    targetDate = displayDates[targetDateIndex];
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = date;
  }

  return targetDate;
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
  dragDataRef: DragDataRef | null,
  hourHeight: number = HOUR_HEIGHT,
  timezone?: string,
): Date {
  const hourDecimal = newTop / hourHeight;
  let hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)));
  let minute = Math.round(Math.max(0, ((hourDecimal - hour) * 60) / 15)) * 15;

  // 60分になった場合は時間を繰り上げる
  if (minute >= 60) {
    minute = 0;
    hour = Math.min(23, hour + 1);
  }

  const targetDate = calculateTargetDate(
    targetDateIndex,
    date,
    viewMode,
    displayDates,
    dragDataRef,
  );

  const newStartTime = new Date(targetDate);
  newStartTime.setHours(hour, minute, 0, 0);

  return timezone ? convertFromTimezone(newStartTime, timezone) : newStartTime;
}

/**
 * プラン期間を計算する
 */
export function calculateEventDuration(
  events: CalendarPlan[],
  eventId: string,
  dragDataRef: DragDataRef | null,
  hourHeight: number = HOUR_HEIGHT,
): { event: CalendarPlan | undefined; durationMs: number } {
  const event = events.find((e) => e.id === eventId);
  let durationMs = 60 * 60 * 1000;

  if (event?.startDate && event?.endDate) {
    durationMs = event.endDate.getTime() - event.startDate.getTime();
  } else if (dragDataRef?.eventDuration) {
    durationMs = (dragDataRef.eventDuration / hourHeight) * 60 * 60 * 1000;
  }

  return { event, durationMs };
}

/**
 * 時間表示を更新する
 */
export function updateTimeDisplay(
  dragElement: HTMLElement | null,
  previewStartTime: Date,
  previewEndTime: Date,
  timezone?: string,
): void {
  if (!dragElement) return;

  const timeElement = dragElement.querySelector('.event-time');
  if (timeElement) {
    if (timezone) {
      const startStr = formatInTimezone(previewStartTime, timezone, 'H:mm');
      const endStr = formatInTimezone(previewEndTime, timezone, 'H:mm');
      timeElement.textContent = `${startStr} - ${endStr}`;
    } else {
      const formattedTimeRange = formatTimeRange(previewStartTime, previewEndTime, '24h');
      timeElement.textContent = formattedTimeRange;
    }
  }
}
