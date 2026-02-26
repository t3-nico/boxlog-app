/**
 * カレンダー固有の日付ヘルパー関数
 *
 * 汎用的な日付操作は `@/lib/date` を使用してください。
 * このファイルにはカレンダービュー固有のユーティリティのみ含まれます。
 */

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
