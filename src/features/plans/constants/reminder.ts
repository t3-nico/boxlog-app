/**
 * リマインダー定数
 */

/** リマインダー分数値 */
export const REMINDER_MINUTES = {
  AT_START: 0,
  MIN_10: 10,
  MIN_30: 30,
  HOUR_1: 60,
  DAY_1: 1440, // 60 * 24
  WEEK_1: 10080, // 60 * 24 * 7
} as const

/** リマインダー分数 → ラベルのマップ */
export const REMINDER_MINUTES_TO_LABEL: Record<number, string> = {
  [REMINDER_MINUTES.AT_START]: '開始時刻',
  [REMINDER_MINUTES.MIN_10]: '10分前',
  [REMINDER_MINUTES.MIN_30]: '30分前',
  [REMINDER_MINUTES.HOUR_1]: '1時間前',
  [REMINDER_MINUTES.DAY_1]: '1日前',
  [REMINDER_MINUTES.WEEK_1]: '1週間前',
}

/** リマインダーラベル → 分数のマップ */
export const REMINDER_LABEL_TO_MINUTES: Record<string, number | null> = {
  '': null,
  開始時刻: REMINDER_MINUTES.AT_START,
  '10分前': REMINDER_MINUTES.MIN_10,
  '30分前': REMINDER_MINUTES.MIN_30,
  '1時間前': REMINDER_MINUTES.HOUR_1,
  '1日前': REMINDER_MINUTES.DAY_1,
  '1週間前': REMINDER_MINUTES.WEEK_1,
}

/**
 * 分数からリマインダーラベルを取得
 */
export function getReminderLabel(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return ''
  return REMINDER_MINUTES_TO_LABEL[minutes] ?? 'カスタム'
}
