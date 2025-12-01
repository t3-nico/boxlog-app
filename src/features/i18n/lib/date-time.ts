/**
 * 日付・時刻の地域対応フォーマットシステム
 */

import type { Locale } from '@/types/i18n'

// サポートされている日付フォーマット
export type DateFormat = 'short' | 'medium' | 'long' | 'full'
export type TimeFormat = 'short' | 'medium' | 'long' | 'full'

// 地域固有の日付・時刻設定
interface LocaleConfig {
  dateFormat: {
    short: string
    medium: string
    long: string
    full: string
  }
  timeFormat: {
    short: string
    medium: string
    long: string
    full: string
  }
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 1 = Monday, etc.
  weekendDays: number[]
  ampm: boolean
  numberSystem: string
}

// 言語・地域別設定
const localeConfigs: Record<string, LocaleConfig> = {
  'en-US': {
    dateFormat: {
      short: 'M/d/yy',
      medium: 'MMM d, y',
      long: 'MMMM d, y',
      full: 'EEEE, MMMM d, y',
    },
    timeFormat: {
      short: 'h:mm a',
      medium: 'h:mm:ss a',
      long: 'h:mm:ss a z',
      full: 'h:mm:ss a zzzz',
    },
    firstDayOfWeek: 0, // Sunday
    weekendDays: [0, 6], // Sunday, Saturday
    ampm: true,
    numberSystem: 'latn',
  },
  'ja-JP': {
    dateFormat: {
      short: 'y/M/d',
      medium: 'y年M月d日',
      long: 'y年M月d日',
      full: 'y年M月d日EEEE',
    },
    timeFormat: {
      short: 'H:mm',
      medium: 'H:mm:ss',
      long: 'H:mm:ss z',
      full: 'H:mm:ss zzzz',
    },
    firstDayOfWeek: 0, // Sunday (Monday in business context)
    weekendDays: [0, 6], // Sunday, Saturday
    ampm: false, // 24時間制が一般的
    numberSystem: 'latn',
  },
  'en-GB': {
    dateFormat: {
      short: 'dd/MM/yy',
      medium: 'd MMM y',
      long: 'd MMMM y',
      full: 'EEEE, d MMMM y',
    },
    timeFormat: {
      short: 'HH:mm',
      medium: 'HH:mm:ss',
      long: 'HH:mm:ss z',
      full: 'HH:mm:ss zzzz',
    },
    firstDayOfWeek: 1, // Monday
    weekendDays: [0, 6],
    ampm: false,
    numberSystem: 'latn',
  },
}

// デフォルト設定
const defaultConfig = localeConfigs['en-US']

// 地域設定を取得
const getLocaleConfig = (locale: Locale): LocaleConfig => {
  // 完全一致を試す
  const config = localeConfigs[locale as keyof typeof localeConfigs]
  if (config) {
    return config
  }

  // 言語コードでの一致を試す
  const languageCode = locale.split('-')[0] ?? 'en'
  const matchingKey = Object.keys(localeConfigs).find((key) => key.startsWith(languageCode))

  if (matchingKey) {
    const matchedConfig = localeConfigs[matchingKey as keyof typeof localeConfigs]
    if (matchedConfig) {
      return matchedConfig
    }
  }

  return defaultConfig as LocaleConfig
}

// 現在のロケールに基づくIntl.DateTimeFormatオプション生成
const getDateTimeFormatOptions = (
  locale: Locale,
  dateStyle?: DateFormat,
  timeStyle?: TimeFormat,
  customOptions?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormatOptions => {
  const config = getLocaleConfig(locale)

  const options: Intl.DateTimeFormatOptions = {
    ...customOptions,
  }

  // 日付スタイルの設定
  if (dateStyle) {
    options.dateStyle = dateStyle
  }

  // 時刻スタイルの設定
  if (timeStyle) {
    options.timeStyle = timeStyle
  }

  // AM/PM表示の設定
  if (timeStyle && !customOptions?.hour12) {
    options.hour12 = config.ampm
  }

  return options
}

// 基本的な日付フォーマット
export const formatDate = (date: Date | string | number, locale: Locale, format: DateFormat = 'medium'): string => {
  const dateObj = new Date(date)
  const options = getDateTimeFormatOptions(locale, format)

  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.warn(`Date formatting failed for locale ${locale}:`, error)
    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  }
}

// 基本的な時刻フォーマット
export const formatTime = (date: Date | string | number, locale: Locale, format: TimeFormat = 'short'): string => {
  const dateObj = new Date(date)
  const options = getDateTimeFormatOptions(locale, undefined, format)

  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.warn(`Time formatting failed for locale ${locale}:`, error)
    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  }
}

// 日付と時刻の組み合わせフォーマット
export const formatDateTime = (
  date: Date | string | number,
  locale: Locale,
  dateFormat: DateFormat = 'medium',
  timeFormat: TimeFormat = 'short'
): string => {
  const dateObj = new Date(date)
  const options = getDateTimeFormatOptions(locale, dateFormat, timeFormat)

  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  } catch (error) {
    console.warn(`DateTime formatting failed for locale ${locale}:`, error)
    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  }
}

// 相対時刻フォーマット（"2 days ago", "in 3 hours"）
export const formatRelativeTime = (
  date: Date | string | number,
  locale: Locale,
  options?: Intl.RelativeTimeFormatOptions
): string => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffMs = targetDate.getTime() - now.getTime()

  // 時間単位での差を計算
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
    ['second', 1000],
  ]

  for (const [unit, ms] of units) {
    const diff = diffMs / ms
    if (Math.abs(diff) >= 1) {
      try {
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...options }).format(Math.round(diff), unit)
      } catch (error) {
        console.warn(`Relative time formatting failed for locale ${locale}:`, error)
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto', ...options }).format(Math.round(diff), unit)
      }
    }
  }

  // 1秒未満の場合
  try {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...options }).format(0, 'second')
  } catch {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(0, 'second')
  }
}

// 期間フォーマット（"2 hours 30 minutes"）
export const formatDuration = (
  milliseconds: number,
  locale: Locale,
  units: Array<'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'> = ['hour', 'minute']
): string => {
  const unitMs = {
    year: 365 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
  }

  const parts: string[] = []
  let remaining = Math.abs(milliseconds)

  for (const unit of units) {
    const value = Math.floor(remaining / unitMs[unit])
    if (value > 0) {
      try {
        const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
        // 単位名を取得するためのハック
        const formatted = formatter.formatToParts(value, unit)
        const unitPart = formatted.find((part) => part.type === 'unit')?.value || unit
        parts.push(`${value} ${unitPart}`)
      } catch {
        // フォールバック
        parts.push(`${value} ${unit}${value !== 1 ? 's' : ''}`)
      }
      remaining -= value * unitMs[unit]
    }
  }

  return parts.length > 0 ? parts.join(' ') : '0 seconds'
}

// カレンダー表示用の週の開始日を取得
export const getFirstDayOfWeek = (locale: Locale): number => {
  return getLocaleConfig(locale).firstDayOfWeek
}

// 週末の曜日を取得
export const getWeekendDays = (locale: Locale): number[] => {
  return getLocaleConfig(locale).weekendDays
}

// 曜日名を取得
export const getWeekdayNames = (locale: Locale, format: 'long' | 'short' | 'narrow' = 'long'): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format })
  const names: string[] = []

  // 日曜日から土曜日までの名前を取得
  for (let i = 0; i < 7; i++) {
    const date = new Date(2023, 0, 1 + i) // 2023年1月1日は日曜日
    names.push(formatter.format(date))
  }

  return names
}

// 月名を取得
export const getMonthNames = (locale: Locale, format: 'long' | 'short' | 'narrow' = 'long'): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { month: format })
  const names: string[] = []

  for (let i = 0; i < 12; i++) {
    const date = new Date(2023, i, 1)
    names.push(formatter.format(date))
  }

  return names
}

// タイムゾーン情報
export const getTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// 日付の妥当性チェック
export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

// 日付範囲のフォーマット
export const formatDateRange = (
  startDate: Date | string | number,
  endDate: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  try {
    // Intl.DateTimeFormat の formatRange を使用（サポートされている場合）
    const formatter = new Intl.DateTimeFormat(locale, options)
    if ('formatRange' in formatter && typeof formatter.formatRange === 'function') {
      return formatter.formatRange(start, end)
    }
  } catch (error) {
    console.warn(`Date range formatting failed for locale ${locale}:`, error)
  }

  // フォールバック: 個別にフォーマットして結合
  const startFormatted = formatDate(start, locale)
  const endFormatted = formatDate(end, locale)

  // 同じ日付の場合は一つだけ表示
  if (startFormatted === endFormatted) {
    return startFormatted
  }

  return `${startFormatted} - ${endFormatted}`
}

// 時刻のみ比較（日付を無視）
export const compareTime = (time1: Date, time2: Date): number => {
  const t1 = time1.getHours() * 3600 + time1.getMinutes() * 60 + time1.getSeconds()
  const t2 = time2.getHours() * 3600 + time2.getMinutes() * 60 + time2.getSeconds()
  return t1 - t2
}

// 現在の地域設定を取得
export const getCurrentLocaleInfo = (locale: Locale) => {
  const config = getLocaleConfig(locale)
  const resolved = new Intl.DateTimeFormat(locale).resolvedOptions()

  return {
    locale,
    config,
    resolved: {
      calendar: resolved.calendar,
      numberingSystem: resolved.numberingSystem,
      timeZone: resolved.timeZone,
    },
    weekdayNames: getWeekdayNames(locale),
    monthNames: getMonthNames(locale),
  }
}

// 便利なエクスポート
export const dateTimeHelpers = {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatDateRange,
  getFirstDayOfWeek,
  getWeekendDays,
  getWeekdayNames,
  getMonthNames,
  getTimezone,
  isValidDate,
  compareTime,
  getCurrentLocaleInfo,
}
