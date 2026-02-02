/**
 * 日付操作ヘルパー関数
 *
 * @deprecated 新しいコードでは `@/lib/date` を直接使用してください。
 * このファイルは後方互換性のため維持されています。
 *
 * @example
 * ```typescript
 * // 推奨: 新しいライブラリを使用
 * import { startOfDay, addDays, formatTime } from '@/lib/date';
 *
 * // 非推奨: このファイルからのインポート
 * import { startOfDay, addDays } from './dateHelpers';
 * ```
 */

// ========================================
// @/lib/date から再エクスポート（共通関数）
// ========================================
export {
  // 日付加算
  addDays,
  addMinutes,
  endOfDay,
  // 配列生成
  generateDateRange,
  // キー生成
  getDateKey,
  // 差分計算
  getDaysDifference,
  endOfMonth as getMonthEnd,
  // 月の境界
  startOfMonth as getMonthStart,
  endOfWeek as getWeekEnd,
  // 週の境界
  startOfWeek as getWeekStart,
  // 比較・判定
  isSameDay,
  isToday,
  isWeekend,
  // パース
  normalizeDate as normalizeEventDate,
  // 日の境界
  startOfDay,
} from '@/lib/date';

// ========================================
// カレンダー固有のフォーマット関数
// ========================================
import {
  formatTime as formatTimeBase,
  formatTimeRange as formatTimeRangeBase,
  type TimeFormat,
} from '@/lib/date';

/**
 * 日付をフォーマット（カレンダービュー用）
 *
 * 日本語固有のフォーマット（「1日(月)」など）
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'numeric' = 'short'): string {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const months = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];

  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];

  switch (format) {
    case 'numeric':
      return `${day}`;
    case 'short':
      return `${day}日(${weekday})`;
    case 'long':
      return `${month}${day}日(${weekday})`;
    default:
      return `${day}`;
  }
}

/**
 * 時刻をフォーマット
 */
export function formatTime(date: Date, format: TimeFormat = '24h'): string {
  return formatTimeBase(date, format);
}

/**
 * 時間範囲をフォーマット
 */
export function formatTimeRange(start: Date, end: Date, format: TimeFormat = '24h'): string {
  return formatTimeRangeBase(start, end, format);
}

// ========================================
// カレンダー固有のユーティリティ
// ========================================

/**
 * イベントの妥当性をチェック
 */
export function isValidEvent<T extends { startDate?: Date | string | null }>(event: T): boolean {
  if (!event.startDate) return false;

  const eventStart = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);

  return !isNaN(eventStart.getTime());
}

/**
 * 今日のインデックスを取得（日付配列内での位置）
 */
export function getTodayIndex(dates: Date[]): number {
  const today = new Date();
  return dates.findIndex((date) => date.toDateString() === today.toDateString());
}
