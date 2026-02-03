import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isWeekend,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';

import { MS_PER_MINUTE } from '@/constants/time';

import type { CalendarViewType, ViewDateRange } from '../types/calendar.types';

import type { CalendarTask } from './time-grid-helpers';

/**
 * 特定の日のタスクをフィルタリング
 */
export function filterTasksForDate(tasks: CalendarTask[], date: Date): CalendarTask[] {
  return tasks.filter((task) => isSameDay(new Date(task.startTime), date));
}

/**
 * 日付のスタイルクラスを取得
 */
export function getDateStyleClass(date: Date): string {
  const classes = ['transition-colors duration-150'];

  if (isToday(date)) {
    classes.push('bg-primary-container ring-2 ring-primary');
  }

  if (isWeekend(date)) {
    classes.push('bg-muted');
  }

  return classes.join(' ');
}

/**
 * タスクの表示用テキストを取得
 */
export function getTaskDisplayText(task: CalendarTask, maxLength: number = 20): string {
  if (task.title.length <= maxLength) {
    return task.title;
  }
  return `${task.title.slice(0, maxLength)}...`;
}

/**
 * 営業時間の設定
 */
export const BUSINESS_HOURS = {
  start: 7,
  end: 22,
};

/**
 * 営業時間内かどうかを判定
 */
export function isBusinessHour(hour: number): boolean {
  return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end;
}

/**
 * 時間ラベルを営業時間でフィルタリング
 */
export function filterBusinessHours(timeLabels: string[]): string[] {
  return timeLabels.filter((time) => {
    const hour = parseInt(time.split(':')[0]!);
    return isBusinessHour(hour);
  });
}

/**
 * 日付の短縮表示
 */
export function formatShortDate(date: Date): string {
  return format(date, 'M/d');
}

/**
 * 曜日の短縮表示
 */
export function formatShortWeekday(date: Date): string {
  return format(date, 'E');
}

/**
 * 日付と曜日の組み合わせ表示
 */
export function formatDateWithWeekday(date: Date): string {
  return format(date, 'M/d (E)');
}

/**
 * 完全な日付表示
 */
export function formatFullDate(date: Date): string {
  return format(date, 'MMM d, yyyy (E)');
}

/**
 * スクロール位置を現在時刻に設定
 */
export function scrollToCurrentTime(container: HTMLElement): void {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 24時間 = 1440分を100%とする
  const currentTimePosition = (currentMinutes / 1440) * 100;
  const containerHeight = container.scrollHeight;
  const viewportHeight = container.clientHeight;

  // 現在時刻を画面中央に配置
  const targetScrollTop = (currentTimePosition / 100) * containerHeight - viewportHeight / 2;

  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth',
  });
}

/**
 * タスクの重複を検出し、横位置を調整
 */
export function adjustTaskPositionsForOverlap(tasks: CalendarTask[]): CalendarTask[] {
  // 簡単な重複検出とレイアウト調整
  const sortedTasks = [...tasks].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return sortedTasks.map((task, _index) => {
    // 重複するタスクの数に応じて幅を調整
    const overlappingTasks = sortedTasks.filter(
      (otherTask) => otherTask.startTime < task.endTime && otherTask.endTime > task.startTime,
    );

    if (overlappingTasks.length > 1) {
      const overlapIndex = overlappingTasks.indexOf(task);
      const width = 100 / overlappingTasks.length;
      const left = width * overlapIndex;

      return {
        ...task,
        _position: {
          left: `${left}%`,
          width: `${width - 2}%`, // 少しマージンを設ける
        },
      };
    }

    return task;
  });
}

/**
 * 分単位の高さを取得（ピクセル単位）
 */
export const MINUTE_HEIGHT = 1; // 1分 = 1px

/**
 * 時間に基づく高さを計算
 */
export function calculateHeightFromDuration(startTime: Date, endTime: Date): number {
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / MS_PER_MINUTE;
  return Math.max(durationMinutes * MINUTE_HEIGHT, 20); // 最小高さ20px
}

/**
 * cn関数（クラス名結合）
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * ビューの日付範囲を計算
 * @param viewType - カレンダーのビュータイプ
 * @param currentDate - 現在表示中の日付
 * @param weekStartsOn - 週の開始日（0: 日曜日, 1: 月曜日, 6: 土曜日）
 */
export function calculateViewDateRange(
  viewType: CalendarViewType,
  currentDate: Date,
  weekStartsOn: 0 | 1 | 6 = 1,
): ViewDateRange {
  let start: Date, end: Date, days: Date[];

  switch (viewType) {
    case 'day':
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
      days = [new Date(start)];
      break;

    case '3day':
      const threeDayStart = subDays(currentDate, 1);
      threeDayStart.setHours(0, 0, 0, 0);
      const threeDayEnd = addDays(currentDate, 1);
      threeDayEnd.setHours(23, 59, 59, 999);
      start = threeDayStart;
      end = threeDayEnd;
      days = eachDayOfInterval({ start, end });
      break;

    case '5day':
      const fiveDayStart = subDays(currentDate, 2);
      fiveDayStart.setHours(0, 0, 0, 0);
      const fiveDayEnd = addDays(currentDate, 2);
      fiveDayEnd.setHours(23, 59, 59, 999);
      start = fiveDayStart;
      end = fiveDayEnd;
      days = eachDayOfInterval({ start, end });
      break;

    case 'week':
      start = startOfWeek(currentDate, { weekStartsOn });
      end = endOfWeek(currentDate, { weekStartsOn });
      days = eachDayOfInterval({ start, end });
      break;

    default:
      // デフォルトは日表示
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
      days = [new Date(start)];
  }

  return { start, end, days };
}

/**
 * 次の期間を取得
 */
export function getNextPeriod(viewType: CalendarViewType, currentDate: Date): Date {
  switch (viewType) {
    case 'day':
      return addDays(currentDate, 1);
    case '3day':
      return addDays(currentDate, 3);
    case '5day':
      return addDays(currentDate, 5);
    case 'week':
      return addWeeks(currentDate, 1);
    default:
      return addDays(currentDate, 1);
  }
}

/**
 * 前の期間を取得
 */
export function getPreviousPeriod(viewType: CalendarViewType, currentDate: Date): Date {
  switch (viewType) {
    case 'day':
      return subDays(currentDate, 1);
    case '3day':
      return subDays(currentDate, 3);
    case '5day':
      return subDays(currentDate, 5);
    case 'week':
      return subWeeks(currentDate, 1);
    default:
      return subDays(currentDate, 1);
  }
}
