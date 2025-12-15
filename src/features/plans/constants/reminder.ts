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

/** リマインダー翻訳キー */
export const REMINDER_TRANSLATION_KEYS = {
  [REMINDER_MINUTES.AT_START]: 'reminder.atStart',
  [REMINDER_MINUTES.MIN_10]: 'reminder.min10',
  [REMINDER_MINUTES.MIN_30]: 'reminder.min30',
  [REMINDER_MINUTES.HOUR_1]: 'reminder.hour1',
  [REMINDER_MINUTES.DAY_1]: 'reminder.day1',
  [REMINDER_MINUTES.WEEK_1]: 'reminder.week1',
} as const

/** リマインダーオプション（UIで使用） */
export const REMINDER_OPTIONS = [
  { value: REMINDER_MINUTES.AT_START, key: 'reminder.atStart' },
  { value: REMINDER_MINUTES.MIN_10, key: 'reminder.min10' },
  { value: REMINDER_MINUTES.MIN_30, key: 'reminder.min30' },
  { value: REMINDER_MINUTES.HOUR_1, key: 'reminder.hour1' },
  { value: REMINDER_MINUTES.DAY_1, key: 'reminder.day1' },
  { value: REMINDER_MINUTES.WEEK_1, key: 'reminder.week1' },
] as const

/**
 * 分数から翻訳キーを取得
 */
export function getReminderTranslationKey(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return ''
  return REMINDER_TRANSLATION_KEYS[minutes as keyof typeof REMINDER_TRANSLATION_KEYS] ?? 'reminder.custom'
}

// ===== 後方互換性のためのレガシーAPI（非推奨） =====
// TODO: 以下のAPIはi18n移行完了後に削除予定

/** @deprecated Use REMINDER_OPTIONS with translations instead */
export const REMINDER_MINUTES_TO_LABEL: Record<number, string> = {
  [REMINDER_MINUTES.AT_START]: '開始時刻',
  [REMINDER_MINUTES.MIN_10]: '10分前',
  [REMINDER_MINUTES.MIN_30]: '30分前',
  [REMINDER_MINUTES.HOUR_1]: '1時間前',
  [REMINDER_MINUTES.DAY_1]: '1日前',
  [REMINDER_MINUTES.WEEK_1]: '1週間前',
}

/** @deprecated Use REMINDER_OPTIONS with translations instead */
export const REMINDER_LABEL_TO_MINUTES: Record<string, number | null> = {
  '': null,
  開始時刻: REMINDER_MINUTES.AT_START,
  '10分前': REMINDER_MINUTES.MIN_10,
  '30分前': REMINDER_MINUTES.MIN_30,
  '1時間前': REMINDER_MINUTES.HOUR_1,
  '1日前': REMINDER_MINUTES.DAY_1,
  '1週間前': REMINDER_MINUTES.WEEK_1,
}

/** @deprecated Use getReminderTranslationKey with translations instead */
export function getReminderLabel(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return ''
  return REMINDER_MINUTES_TO_LABEL[minutes] ?? 'カスタム'
}
