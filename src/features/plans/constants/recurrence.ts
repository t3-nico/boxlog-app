/**
 * 繰り返し（リカレンス）定数
 */

/** 繰り返しタイプ */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'

/** 繰り返しタイプ → 翻訳キーのマップ */
export const RECURRENCE_TRANSLATION_KEYS: Record<RecurrenceType, string> = {
  none: 'recurrence.none',
  daily: 'recurrence.daily',
  weekly: 'recurrence.weekly',
  monthly: 'recurrence.monthly',
  yearly: 'recurrence.yearly',
  weekdays: 'recurrence.weekdays',
}

/** 繰り返しオプション（UIで使用） */
export const RECURRENCE_OPTIONS = [
  { value: 'daily' as RecurrenceType, key: 'recurrence.daily' },
  { value: 'weekly' as RecurrenceType, key: 'recurrence.weekly' },
  { value: 'monthly' as RecurrenceType, key: 'recurrence.monthly' },
  { value: 'yearly' as RecurrenceType, key: 'recurrence.yearly' },
  { value: 'weekdays' as RecurrenceType, key: 'recurrence.weekdays' },
] as const

/**
 * 繰り返しタイプから翻訳キーを取得
 */
export function getRecurrenceTranslationKey(type: string | null | undefined): string {
  if (!type || type === 'none') return 'recurrence.none'
  return RECURRENCE_TRANSLATION_KEYS[type as RecurrenceType] ?? 'recurrence.none'
}
