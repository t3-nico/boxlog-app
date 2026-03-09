/**
 * Entry → CalendarEvent 変換アダプター
 *
 * entries テーブルのデータを
 * CalendarEvent（コア型）に変換して、カレンダービューに提供する。
 * 繰り返しエントリの展開も含む。
 */

import { MS_PER_MINUTE } from '@/constants/time';

import type { CalendarEvent } from '@/core/types/calendar-event';
import type { EntryWithTags } from '@/core/types/entry';
import {
  expandRecurrence,
  isRecurringEntry,
  type EntryInstanceException,
  type ExpandedOccurrence,
} from '@/lib/entry-recurrence';
import { getEntryState } from '@/lib/entry-status';
import { encodeInstanceId } from '@/lib/instance-id';

export type { EntryInstanceException };

/**
 * EntryをCalendarEvent型に変換（非繰り返し用）
 *
 * - status は時間位置から自動判定
 * - title が空の場合はカレンダー側で「(無題)」表示
 */
export function entryToCalendarEvent(entry: EntryWithTags): CalendarEvent | null {
  if (!entry.start_time || !entry.end_time) {
    return null;
  }

  const startDate = new Date(entry.start_time);
  const endDate = new Date(entry.end_time);
  const actualStartDate = entry.actual_start_time ? new Date(entry.actual_start_time) : null;
  const actualEndDate = entry.actual_end_time ? new Date(entry.actual_end_time) : null;
  const createdAt = entry.created_at ? new Date(entry.created_at) : new Date();
  const updatedAt = entry.updated_at ? new Date(entry.updated_at) : new Date();
  const entryState = getEntryState(entry);

  const isMultiDay =
    startDate.getFullYear() !== endDate.getFullYear() ||
    startDate.getMonth() !== endDate.getMonth() ||
    startDate.getDate() !== endDate.getDate();

  const duration =
    entry.duration_minutes ?? Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  return {
    id: entry.id,
    title: entry.title || '',
    description: entry.description ?? undefined,
    startDate,
    endDate,
    status: entryState === 'past' ? 'closed' : 'open',
    color: '',
    reminder_minutes: entry.reminder_minutes,
    tagId: entry.tagId ?? null,
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration,
    isMultiDay,
    isRecurring: entry.recurrence_type !== null && entry.recurrence_type !== 'none',
    origin: entry.origin,
    entryState,
    fulfillmentScore: entry.fulfillment_score,
    actualStartDate,
    actualEndDate,
  };
}

/**
 * 繰り返しオカレンスをCalendarEventに変換
 */
function occurrenceToCalendarEvent(
  baseEntry: EntryWithTags,
  occurrence: ExpandedOccurrence,
): CalendarEvent {
  const createdAt = baseEntry.created_at ? new Date(baseEntry.created_at) : new Date();
  const updatedAt = baseEntry.updated_at ? new Date(baseEntry.updated_at) : new Date();

  let startDate: Date;
  let endDate: Date;

  if (occurrence.overrideStartTime) {
    startDate = new Date(occurrence.overrideStartTime);
  } else if (occurrence.startTime) {
    const [startHour, startMin] = occurrence.startTime.split(':').map(Number);
    startDate = new Date(occurrence.date);
    startDate.setHours(startHour ?? 0, startMin ?? 0, 0, 0);
  } else {
    startDate = new Date(occurrence.date);
    startDate.setHours(0, 0, 0, 0);
  }

  if (occurrence.overrideEndTime) {
    endDate = new Date(occurrence.overrideEndTime);
  } else if (occurrence.endTime) {
    const [endHour, endMin] = occurrence.endTime.split(':').map(Number);
    endDate = new Date(occurrence.date);
    endDate.setHours(endHour ?? 0, endMin ?? 0, 0, 0);
  } else {
    endDate = new Date(occurrence.date);
    endDate.setHours(23, 59, 59, 999);
  }

  const title = occurrence.overrideTitle ?? baseEntry.title;
  const description = occurrence.overrideDescription ?? baseEntry.description;
  const instanceDate = occurrence.date.toISOString().slice(0, 10);
  const instanceId = encodeInstanceId(baseEntry.id, instanceDate);
  const entryState = getEntryState({
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
  });

  return {
    id: instanceId,
    title: title || '',
    description: description || undefined,
    startDate,
    endDate,
    status: entryState === 'past' ? 'closed' : 'open',
    color: '',
    reminder_minutes: baseEntry.reminder_minutes,
    tagId: baseEntry.tagId ?? null,
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_MINUTE),
    isMultiDay: false,
    isRecurring: true,
    origin: baseEntry.origin,
    entryState,
    fulfillmentScore: baseEntry.fulfillment_score,
    calendarId: baseEntry.id,
    originalEntryId: baseEntry.id,
    instanceDate,
    isException: occurrence.isException,
    exceptionType: occurrence.exceptionType,
    actualStartDate: null,
    actualEndDate: null,
  };
}

/**
 * エントリを展開（繰り返し含む）してCalendarEvent配列に変換
 *
 * @param entries - エントリ配列（タグID付き）
 * @param rangeStart - 表示範囲の開始日
 * @param rangeEnd - 表示範囲の終了日
 * @param exceptionsMap - DBから取得した例外情報のマップ（entryId -> exceptions）
 * @returns 展開されたCalendarEvent配列
 */
export function expandEntriesToCalendarEvents(
  entries: EntryWithTags[],
  rangeStart: Date,
  rangeEnd: Date,
  exceptionsMap: Map<string, EntryInstanceException[]> = new Map(),
): CalendarEvent[] {
  const result: CalendarEvent[] = [];

  for (const entry of entries) {
    if (!entry.start_time || !entry.end_time) {
      continue;
    }

    if (isRecurringEntry(entry)) {
      // 繰り返しエントリを展開
      const exceptions = exceptionsMap.get(entry.id) ?? [];
      const occurrences = expandRecurrence(entry, rangeStart, rangeEnd, exceptions);

      for (const occurrence of occurrences) {
        result.push(occurrenceToCalendarEvent(entry, occurrence));
      }
    } else {
      // 通常エントリはそのまま変換
      const calendarEvent = entryToCalendarEvent(entry);
      if (calendarEvent) {
        result.push(calendarEvent);
      }
    }
  }

  return result;
}

/**
 * 複数のEntryをCalendarEvent型に変換（非繰り返しのみ）
 * start_time/end_time がないEntryはスキップされる
 */
export function entriesToCalendarEvents(entries: EntryWithTags[]): CalendarEvent[] {
  return entries
    .map(entryToCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null);
}
