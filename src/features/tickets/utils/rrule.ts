/**
 * RRULE（Recurrence Rule）変換ユーティリティ
 * RFC 5545 iCalendar仕様に準拠
 */

import type { RecurrenceConfig } from '../types/ticket'

const WEEKDAY_MAP = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/**
 * RecurrenceConfigをRRULE文字列に変換
 *
 * @param config - 繰り返し設定
 * @returns RRULE文字列（例: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;UNTIL=20251231"）
 *
 * @example
 * ```ts
 * configToRRule({
 *   frequency: 'weekly',
 *   interval: 2,
 *   byWeekday: [1, 3, 5],
 *   endType: 'count',
 *   count: 10
 * })
 * // => "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;COUNT=10"
 * ```
 */
export function configToRRule(config: RecurrenceConfig): string {
  const parts: string[] = []

  // FREQ（必須）
  parts.push(`FREQ=${config.frequency.toUpperCase()}`)

  // INTERVAL
  if (config.interval > 1) {
    parts.push(`INTERVAL=${config.interval}`)
  }

  // BYDAY（週次）
  if (config.frequency === 'weekly' && config.byWeekday?.length) {
    const days = config.byWeekday.map((d) => WEEKDAY_MAP[d]).join(',')
    parts.push(`BYDAY=${days}`)
  }

  // BYMONTHDAY（月次：日付指定）
  if (config.frequency === 'monthly' && config.byMonthDay) {
    parts.push(`BYMONTHDAY=${config.byMonthDay}`)
  }

  // BYSETPOS（月次：第N週指定）
  if (config.frequency === 'monthly' && config.bySetPos !== undefined && config.byWeekday?.length) {
    const days = config.byWeekday.map((d) => WEEKDAY_MAP[d]).join(',')
    parts.push(`BYDAY=${days}`)
    parts.push(`BYSETPOS=${config.bySetPos}`)
  }

  // 終了条件
  if (config.endType === 'until' && config.endDate) {
    const formatted = config.endDate.replace(/-/g, '')
    parts.push(`UNTIL=${formatted}`)
  } else if (config.endType === 'count' && config.count) {
    parts.push(`COUNT=${config.count}`)
  }

  return parts.join(';')
}

/**
 * RRULE文字列をRecurrenceConfigに変換
 *
 * @param rrule - RRULE文字列
 * @returns RecurrenceConfig
 *
 * @example
 * ```ts
 * ruleToConfig("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;COUNT=10")
 * // => {
 * //   frequency: 'weekly',
 * //   interval: 2,
 * //   byWeekday: [1, 3, 5],
 * //   endType: 'count',
 * //   count: 10
 * // }
 * ```
 */
export function ruleToConfig(rrule: string): RecurrenceConfig {
  const parts = rrule.split(';')
  const config: Partial<RecurrenceConfig> = {
    frequency: 'daily',
    interval: 1,
    endType: 'never',
  }

  parts.forEach((part) => {
    const [key, value] = part.split('=')

    switch (key) {
      case 'FREQ':
        config.frequency = value.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'yearly'
        break
      case 'INTERVAL':
        config.interval = Number(value)
        break
      case 'BYDAY':
        config.byWeekday = value.split(',').map((day) => WEEKDAY_MAP.indexOf(day))
        break
      case 'BYMONTHDAY':
        config.byMonthDay = Number(value)
        break
      case 'BYSETPOS':
        config.bySetPos = Number(value)
        break
      case 'UNTIL':
        config.endType = 'until'
        config.endDate = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
        break
      case 'COUNT':
        config.endType = 'count'
        config.count = Number(value)
        break
    }
  })

  return config as RecurrenceConfig
}

/**
 * RecurrenceConfigを人間が読みやすい文字列に変換
 *
 * @param config - 繰り返し設定
 * @returns 人間が読みやすい文字列（例: "2週間ごと、月・水・金、10回"）
 *
 * @example
 * ```ts
 * configToReadable({
 *   frequency: 'weekly',
 *   interval: 2,
 *   byWeekday: [1, 3, 5],
 *   endType: 'count',
 *   count: 10
 * })
 * // => "2週間ごと、月・水・金、10回"
 * ```
 */
export function configToReadable(config: RecurrenceConfig): string {
  const parts: string[] = []

  // 頻度 + 間隔
  const intervalText = config.interval > 1 ? `${config.interval}` : ''
  if (config.frequency === 'daily') {
    parts.push(intervalText ? `${intervalText}日ごと` : '毎日')
  } else if (config.frequency === 'weekly') {
    parts.push(intervalText ? `${intervalText}週間ごと` : '毎週')
  } else if (config.frequency === 'monthly') {
    parts.push(intervalText ? `${intervalText}ヶ月ごと` : '毎月')
  } else if (config.frequency === 'yearly') {
    parts.push(intervalText ? `${intervalText}年ごと` : '毎年')
  }

  // 曜日（週次のみ）
  if (config.frequency === 'weekly' && config.byWeekday?.length) {
    const weekdayNames = ['日', '月', '火', '水', '木', '金', '土']
    const days = config.byWeekday.map((d) => weekdayNames[d]).join('・')
    parts.push(days)
  }

  // 日付（月次のみ）
  if (config.frequency === 'monthly') {
    if (config.byMonthDay) {
      parts.push(`${config.byMonthDay}日`)
    } else if (config.bySetPos !== undefined && config.byWeekday?.length) {
      const weekdayNames = ['日', '月', '火', '水', '木', '金', '土']
      const weekdayName = weekdayNames[config.byWeekday[0]]
      if (config.bySetPos === -1) {
        parts.push(`最終${weekdayName}曜日`)
      } else {
        parts.push(`第${config.bySetPos}${weekdayName}曜日`)
      }
    }
  }

  // 終了条件
  if (config.endType === 'until' && config.endDate) {
    parts.push(`${config.endDate}まで`)
  } else if (config.endType === 'count' && config.count) {
    parts.push(`${config.count}回`)
  }

  return parts.join('、')
}
