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

// ===== 後方互換性のためのレガシーAPI（非推奨） =====
// TODO: 以下のAPIはi18n移行完了後に削除予定

/** @deprecated Use RECURRENCE_TRANSLATION_KEYS with translations instead */
export const RECURRENCE_TYPE_TO_LABEL: Record<RecurrenceType, string> = {
  none: '繰り返し',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
  yearly: '毎年',
  weekdays: '平日',
}

/** @deprecated Use RECURRENCE_OPTIONS with translations instead */
export const RECURRENCE_LABEL_TO_TYPE: Record<string, RecurrenceType> = {
  '': 'none',
  毎日: 'daily',
  毎週: 'weekly',
  毎月: 'monthly',
  毎年: 'yearly',
  平日: 'weekdays',
}

/** @deprecated Use getRecurrenceTranslationKey with translations instead */
export function getRecurrenceLabel(type: string | null | undefined): string {
  if (!type || type === 'none') return '繰り返し'
  return RECURRENCE_TYPE_TO_LABEL[type as RecurrenceType] ?? '繰り返し'
}
