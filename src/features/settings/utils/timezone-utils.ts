import { format } from 'date-fns'
import { formatInTimeZone as formatInTZ, fromZonedTime, toZonedTime } from 'date-fns-tz'

import type { DateFormatType } from '../stores/useCalendarSettingsStore'

// タイムゾーンリストの取得
export function getTimeZones() {
  const timezones = [
    { value: 'Pacific/Honolulu', label: 'ホノルル (GMT-10)', offset: -10 },
    { value: 'America/Anchorage', label: 'アンカレッジ (GMT-9)', offset: -9 },
    { value: 'America/Los_Angeles', label: 'ロサンゼルス (GMT-8)', offset: -8 },
    { value: 'America/Denver', label: 'デンバー (GMT-7)', offset: -7 },
    { value: 'America/Chicago', label: 'シカゴ (GMT-6)', offset: -6 },
    { value: 'America/New_York', label: 'ニューヨーク (GMT-5)', offset: -5 },
    { value: 'America/Sao_Paulo', label: 'サンパウロ (GMT-3)', offset: -3 },
    { value: 'Europe/London', label: 'ロンドン (GMT+0)', offset: 0 },
    { value: 'Europe/Paris', label: 'パリ (GMT+1)', offset: 1 },
    { value: 'Europe/Moscow', label: 'モスクワ (GMT+3)', offset: 3 },
    { value: 'Asia/Dubai', label: 'ドバイ (GMT+4)', offset: 4 },
    { value: 'Asia/Kolkata', label: 'コルカタ (GMT+5:30)', offset: 5.5 },
    { value: 'Asia/Shanghai', label: '上海 (GMT+8)', offset: 8 },
    { value: 'Asia/Tokyo', label: '東京 (GMT+9)', offset: 9 },
    { value: 'Australia/Sydney', label: 'シドニー (GMT+10)', offset: 10 },
    { value: 'Pacific/Auckland', label: 'オークランド (GMT+12)', offset: 12 },
  ]

  return timezones.sort((a, b) => a.offset - b.offset)
}

// 時間表示のフォーマット（タイムゾーン対応）
export function formatTimeWithSettings(date: Date, timeFormat: '12h' | '24h', timezone?: string): string {
  const formatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'

  // タイムゾーンが指定されている場合は、そのタイムゾーンで表示
  if (timezone) {
    return formatInTZ(date, timezone, formatString)
  }

  // タイムゾーンが指定されていない場合は、ローカルタイムゾーンで表示
  return format(date, formatString)
}

// 時間のみのフォーマット（時間軸用）
export function formatHour(hour: number, timeFormat: '12h' | '24h'): string {
  if (timeFormat === '24h') {
    return `${hour}:00`
  }

  if (hour === 0) return '12:00 AM'
  if (hour === 12) return '12:00 PM'
  if (hour < 12) return `${hour}:00 AM`
  return `${hour - 12}:00 PM`
}

// 現在時刻をタイムゾーンでフォーマット
export function formatInTimeZone(date: Date, timezone: string, formatString: string): string {
  return formatInTZ(date, timezone, formatString)
}

// UTC時刻を指定タイムゾーンの時刻に変換
export function convertToTimezone(utcDate: Date, timezone: string): Date {
  return toZonedTime(utcDate, timezone)
}

// 指定タイムゾーンの時刻をUTCに変換
export function convertFromTimezone(zonedDate: Date, timezone: string): Date {
  // zonedDateは「そのタイムゾーンでの時刻」として解釈されるべきDateオブジェクト
  // 例: 2025-11-20 16:00 (JST) → 2025-11-20 07:00 (UTC)
  return fromZonedTime(zonedDate, timezone)
}

/**
 * 日付をユーザー設定のフォーマットで表示
 * @param date - フォーマットする日付
 * @param dateFormat - 日付フォーマット設定
 * @param timezone - オプションのタイムゾーン
 */
export function formatDateWithSettings(date: Date, dateFormat: DateFormatType, timezone?: string): string {
  if (timezone) {
    return formatInTZ(date, timezone, dateFormat)
  }
  return format(date, dateFormat)
}

/**
 * 日付と時刻をユーザー設定のフォーマットで表示
 * @param date - フォーマットする日付
 * @param dateFormat - 日付フォーマット設定
 * @param timeFormat - 時間フォーマット設定
 * @param timezone - オプションのタイムゾーン
 */
export function formatDateTimeWithSettings(
  date: Date,
  dateFormat: DateFormatType,
  timeFormat: '12h' | '24h',
  timezone?: string
): string {
  const timeFormatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'
  const fullFormat = `${dateFormat} ${timeFormatString}`

  if (timezone) {
    return formatInTZ(date, timezone, fullFormat)
  }
  return format(date, fullFormat)
}

// タイムゾーンの略称を取得
export function getTimezoneAbbreviation(timezone: string): string {
  // よく使われるタイムゾーンの略称マッピング
  const abbreviations: Record<string, string> = {
    'Asia/Tokyo': 'JST',
    'America/New_York': 'EST',
    'America/Los_Angeles': 'PST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Australia/Sydney': 'AEDT',
    'Pacific/Auckland': 'NZDT',
  }

  // マッピングにある場合はそれを返す
  if (abbreviations[timezone]) {
    return abbreviations[timezone]
  }

  // マッピングにない場合は、Intl.DateTimeFormatを使って略称を取得
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(new Date())
    const timeZonePart = parts.find((part) => part.type === 'timeZoneName')
    return timeZonePart?.value || 'UTC'
  } catch {
    return 'UTC'
  }
}
