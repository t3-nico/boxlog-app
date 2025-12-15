/**
 * 繰り返し（リカレンス）定数
 */

/** 繰り返しタイプ */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'

/** 繰り返しタイプ → ラベルのマップ */
export const RECURRENCE_TYPE_TO_LABEL: Record<RecurrenceType, string> = {
  none: '繰り返し',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
  yearly: '毎年',
  weekdays: '平日',
}

/** 繰り返しラベル → タイプのマップ */
export const RECURRENCE_LABEL_TO_TYPE: Record<string, RecurrenceType> = {
  '': 'none',
  毎日: 'daily',
  毎週: 'weekly',
  毎月: 'monthly',
  毎年: 'yearly',
  平日: 'weekdays',
}

/**
 * 繰り返しタイプからラベルを取得
 */
export function getRecurrenceLabel(type: string | null | undefined): string {
  if (!type || type === 'none') return '繰り返し'
  return RECURRENCE_TYPE_TO_LABEL[type as RecurrenceType] ?? '繰り返し'
}
