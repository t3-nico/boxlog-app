/**
 * カレンダービューのルーティングユーティリティ
 *
 * URLパスからカレンダービューページかどうかを判定する。
 * /calendar プレフィックスを廃止し /day, /week 等に直接ルーティングするため、
 * パスのセグメントからビュー名を判定する必要がある。
 */

const CALENDAR_VIEWS = ['day', 'week', 'agenda', 'timesheet', 'stats'];

/**
 * ロケールを除いたパスがカレンダービューかどうかを判定
 *
 * @param pathWithoutLocale - ロケールプレフィックスを除いたパス（例: "/day", "/week?date=2026-01-01", "/3day"）
 */
export function isCalendarViewPath(pathWithoutLocale: string): boolean {
  // 先頭の "/" を除いた最初のセグメントを取得
  const segment = pathWithoutLocale.split('/')[1];
  if (!segment) return false;
  // query string を除去
  const clean = segment.split('?')[0];
  if (!clean) return false;
  if (CALENDAR_VIEWS.includes(clean)) return true;
  // multi-day view: 2day〜9day
  return /^\d+day$/.test(clean);
}
