/**
 * 通知設定のユーティリティ関数
 */

/**
 * UI表示文字列をreminder_minutes（分）に変換
 *
 * @param reminderType - UI表示文字列（'', '開始時刻', '10分前', ...）
 * @returns reminder_minutes（分数、null、undefined）
 *
 * @example
 * reminderTypeToMinutes('10分前') // => 10
 * reminderTypeToMinutes('開始時刻') // => 0
 * reminderTypeToMinutes('') // => null
 */
export function reminderTypeToMinutes(reminderType: string): number | null | undefined {
  if (!reminderType || reminderType === 'none') return null

  switch (reminderType) {
    case '開始時刻':
      return 0
    case '10分前':
      return 10
    case '30分前':
      return 30
    case '1時間前':
      return 60
    case '1日前':
      return 1440 // 24 * 60
    case '1週間前':
      return 10080 // 7 * 24 * 60
    default:
      return null
  }
}

/**
 * reminder_minutes（分）をUI表示文字列に変換
 *
 * @param minutes - reminder_minutes（分数）
 * @returns UI表示文字列
 *
 * @example
 * minutesToReminderType(10) // => '10分前'
 * minutesToReminderType(0) // => '開始時刻'
 * minutesToReminderType(null) // => ''
 */
export function minutesToReminderType(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return ''

  switch (minutes) {
    case 0:
      return '開始時刻'
    case 10:
      return '10分前'
    case 30:
      return '30分前'
    case 60:
      return '1時間前'
    case 1440:
      return '1日前'
    case 10080:
      return '1週間前'
    default:
      return ''
  }
}
