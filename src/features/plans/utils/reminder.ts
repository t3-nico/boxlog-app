/**
 * 通知設定のユーティリティ関数
 */

/**
 * リマインダー設定の定義
 * UI表示文字列と分数のマッピング
 */
export const REMINDER_OPTIONS = [
  { label: '開始時刻', minutes: 0 },
  { label: '10分前', minutes: 10 },
  { label: '30分前', minutes: 30 },
  { label: '1時間前', minutes: 60 },
  { label: '1日前', minutes: 1440 },
  { label: '1週間前', minutes: 10080 },
] as const;

/**
 * UI表示文字列をreminder_minutes（分）に変換
 *
 * @param reminderType - UI表示文字列（'', '開始時刻', '10分前', ...）
 * @returns reminder_minutes（分数、null）
 *
 * @example
 * reminderTypeToMinutes('10分前') // => 10
 * reminderTypeToMinutes('開始時刻') // => 0
 * reminderTypeToMinutes('') // => null
 */
export function reminderTypeToMinutes(reminderType: string): number | null {
  if (!reminderType || reminderType === 'none') return null;

  const option = REMINDER_OPTIONS.find((opt) => opt.label === reminderType);
  return option?.minutes ?? null;
}

/**
 * reminder_minutes（分）をUI表示文字列に変換
 *
 * @param minutes - reminder_minutes（分数）
 * @param fallback - 定義外の値の場合のフォールバック（デフォルト: 'カスタム'）
 * @returns UI表示文字列
 *
 * @example
 * minutesToReminderType(10) // => '10分前'
 * minutesToReminderType(0) // => '開始時刻'
 * minutesToReminderType(null) // => ''
 * minutesToReminderType(15) // => 'カスタム'
 */
export function minutesToReminderType(
  minutes: number | null | undefined,
  fallback: string = 'カスタム',
): string {
  if (minutes === null || minutes === undefined) return '';

  const option = REMINDER_OPTIONS.find((opt) => opt.minutes === minutes);
  return option?.label ?? fallback;
}
