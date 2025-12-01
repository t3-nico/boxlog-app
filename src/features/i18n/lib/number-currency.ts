/**
 * 数値・通貨の地域対応フォーマットシステム
 */

import type { Locale } from '@/types/i18n'

// サポートされている数値フォーマットタイプ
export type NumberFormat = 'decimal' | 'percent' | 'scientific' | 'engineering' | 'compact'
export type CurrencyDisplay = 'symbol' | 'code' | 'name' | 'narrowSymbol'
export type CurrencySign = 'standard' | 'accounting'

// 地域別通貨設定
interface CurrencyConfig {
  currency: string
  symbol: string
  name: string
  decimalPlaces: number
  symbolPosition: 'before' | 'after'
}

// 主要通貨の設定
const currencyConfigs: Record<string, CurrencyConfig> = {
  USD: {
    currency: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  JPY: {
    currency: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalPlaces: 0,
    symbolPosition: 'before',
  },
  EUR: {
    currency: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  GBP: {
    currency: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  CNY: {
    currency: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimalPlaces: 2,
    symbolPosition: 'before',
  },
  KRW: {
    currency: 'KRW',
    symbol: '₩',
    name: 'Korean Won',
    decimalPlaces: 0,
    symbolPosition: 'before',
  },
}

// 言語・地域別のデフォルト通貨
const defaultCurrencies: Record<string, string> = {
  'en-US': 'USD',
  'ja-JP': 'JPY',
  'en-GB': 'GBP',
  'de-DE': 'EUR',
  'fr-FR': 'EUR',
  'zh-CN': 'CNY',
  'ko-KR': 'KRW',
}

// 地域のデフォルト通貨を取得
const getDefaultCurrency = (locale: Locale): string => {
  // 完全一致を試す
  if (locale in defaultCurrencies) {
    return defaultCurrencies[locale as keyof typeof defaultCurrencies] ?? 'USD'
  }

  // 言語コードでの一致を試す
  const languageCode = locale.split('-')[0] ?? 'en'
  const matchingKey = Object.keys(defaultCurrencies).find((key) => key.startsWith(languageCode))

  if (matchingKey) {
    return defaultCurrencies[matchingKey] ?? 'USD'
  }

  return 'USD' // デフォルト
}

// 基本的な数値フォーマット
export const formatNumber = (
  value: number,
  locale: Locale,
  format: NumberFormat = 'decimal',
  options?: Intl.NumberFormatOptions
): string => {
  const formatOptions: Intl.NumberFormatOptions = {
    ...options,
  }

  // フォーマットタイプの設定
  switch (format) {
    case 'percent':
      formatOptions.style = 'percent'
      break
    case 'scientific':
      formatOptions.notation = 'scientific'
      break
    case 'engineering':
      formatOptions.notation = 'engineering'
      break
    case 'compact':
      formatOptions.notation = 'compact'
      break
    case 'decimal':
    default:
      formatOptions.style = 'decimal'
      break
  }

  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value)
  } catch (error) {
    console.warn(`Number formatting failed for locale ${locale}:`, error)
    return new Intl.NumberFormat('en-US', formatOptions).format(value)
  }
}

// 通貨フォーマット
export const formatCurrency = (
  value: number,
  locale: Locale,
  currency?: string,
  options?: Intl.NumberFormatOptions
): string => {
  const targetCurrency = currency || getDefaultCurrency(locale)

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: targetCurrency,
    ...options,
  }

  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value)
  } catch (error) {
    console.warn(`Currency formatting failed for locale ${locale}, currency ${targetCurrency}:`, error)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', ...options }).format(value)
  }
}

// パーセンテージフォーマット
export const formatPercentage = (value: number, locale: Locale, options?: Intl.NumberFormatOptions): string => {
  return formatNumber(value, locale, 'percent', options)
}

// コンパクト表記（1.2K, 1.5M等）
export const formatCompact = (value: number, locale: Locale, options?: Intl.NumberFormatOptions): string => {
  return formatNumber(value, locale, 'compact', options)
}

// 科学的記数法
export const formatScientific = (value: number, locale: Locale, options?: Intl.NumberFormatOptions): string => {
  return formatNumber(value, locale, 'scientific', options)
}

// 単位付き数値フォーマット
export const formatWithUnit = (
  value: number,
  locale: Locale,
  unit: string,
  options?: Intl.NumberFormatOptions
): string => {
  const formattedNumber = formatNumber(value, locale, 'decimal', options)

  // 日本語の場合は単位を後に付ける
  if (locale.startsWith('ja')) {
    return `${formattedNumber}${unit}`
  }

  // 英語等は基本的にスペース区切り
  return `${formattedNumber} ${unit}`
}

// ファイルサイズフォーマット
export const formatFileSize = (bytes: number, locale: Locale, binary: boolean = true): string => {
  const base = binary ? 1024 : 1000
  const units = binary ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] : ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  if (bytes === 0) return formatWithUnit(0, locale, units[0] ?? 'B')

  const exponent = Math.floor(Math.log(Math.abs(bytes)) / Math.log(base))
  const value = bytes / Math.pow(base, exponent)
  const unit = units[Math.min(exponent, units.length - 1)] ?? 'B'

  const precision = exponent === 0 ? 0 : 1
  const formatted = formatNumber(value, locale, 'decimal', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })

  return formatWithUnit(parseFloat(formatted), locale, unit)
}

// 価格範囲フォーマット
export const formatPriceRange = (
  minPrice: number,
  maxPrice: number,
  locale: Locale,
  currency?: string,
  options?: Intl.NumberFormatOptions
): string => {
  const minFormatted = formatCurrency(minPrice, locale, currency, options)
  const maxFormatted = formatCurrency(maxPrice, locale, currency, options)

  if (minPrice === maxPrice) {
    return minFormatted
  }

  // 地域に応じた範囲記号
  const rangeSymbol = locale.startsWith('ja') ? '〜' : ' - '
  return `${minFormatted}${rangeSymbol}${maxFormatted}`
}

// 数値の序数詞（1st, 2nd, 3rd等）
export const formatOrdinal = (value: number, locale: Locale): string => {
  try {
    // Intl.PluralRulesを使用して序数詞を生成
    const pr = new Intl.PluralRules(locale, { type: 'ordinal' })
    const rule = pr.select(value)

    // 英語の序数詞サフィックス
    if (locale.startsWith('en')) {
      const suffixes: Record<string, string> = {
        one: 'st',
        two: 'nd',
        few: 'rd',
        other: 'th',
      }
      return `${value}${suffixes[rule] || 'th'}`
    }

    // 日本語は「第N」形式
    if (locale.startsWith('ja')) {
      return `第${value}`
    }

    // その他の言語はデフォルト
    return value.toString()
  } catch (error) {
    console.warn(`Ordinal formatting failed for locale ${locale}:`, error)
    return value.toString()
  }
}

// 電話番号フォーマット（簡易版）
export const formatPhoneNumber = (phone: string, locale: Locale, countryCode?: string): string => {
  // 数字以外を除去
  const cleanPhone = phone.replace(/\D/g, '')

  if (locale.startsWith('ja')) {
    // 日本の電話番号フォーマット
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    }
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
  } else if (locale.startsWith('en-US')) {
    // アメリカの電話番号フォーマット
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    }
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
    }
  }

  // 国番号付きの場合
  if (countryCode && !cleanPhone.startsWith(countryCode)) {
    return `+${countryCode} ${cleanPhone}`
  }

  return cleanPhone
}

// 割引率フォーマット
export const formatDiscount = (
  originalPrice: number,
  discountedPrice: number,
  locale: Locale,
  showAmount: boolean = false
): string => {
  const discountAmount = originalPrice - discountedPrice
  const discountRate = discountAmount / originalPrice

  if (showAmount) {
    const formattedAmount = formatCurrency(discountAmount, locale)
    const formattedRate = formatPercentage(discountRate, locale, { maximumFractionDigits: 0 })
    return locale.startsWith('ja')
      ? `${formattedAmount}オフ（${formattedRate}引き）`
      : `${formattedAmount} off (${formattedRate} discount)`
  }

  return formatPercentage(discountRate, locale, { maximumFractionDigits: 0 })
}

// 評価・レーティングフォーマット
export const formatRating = (
  rating: number,
  maxRating: number = 5,
  locale: Locale,
  showMax: boolean = true
): string => {
  const formattedRating = formatNumber(rating, locale, 'decimal', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  if (showMax) {
    const formattedMax = formatNumber(maxRating, locale)
    return locale.startsWith('ja') ? `${formattedRating}/${formattedMax}` : `${formattedRating} out of ${formattedMax}`
  }

  return formattedRating
}

// 数値の範囲チェック
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

// 数値の妥当性チェック
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

// 通貨情報を取得
export const getCurrencyInfo = (currencyCode: string): CurrencyConfig | null => {
  return currencyConfigs[currencyCode] || null
}

// サポートされている通貨一覧
export const getSupportedCurrencies = (): string[] => {
  return Object.keys(currencyConfigs)
}

// 現在の地域の数値・通貨情報
export const getCurrentNumberFormatInfo = (locale: Locale) => {
  const resolved = new Intl.NumberFormat(locale).resolvedOptions()
  const defaultCurrency = getDefaultCurrency(locale)

  return {
    locale,
    defaultCurrency,
    currencyInfo: getCurrencyInfo(defaultCurrency),
    resolved: {
      numberingSystem: resolved.numberingSystem,
      locale: resolved.locale,
    },
    examples: {
      number: formatNumber(1234.56, locale),
      currency: formatCurrency(1234.56, locale),
      percentage: formatPercentage(0.1234, locale),
      compact: formatCompact(1234567, locale),
    },
  }
}

// 便利なエクスポート
export const numberCurrencyHelpers = {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompact,
  formatScientific,
  formatWithUnit,
  formatFileSize,
  formatPriceRange,
  formatOrdinal,
  formatPhoneNumber,
  formatDiscount,
  formatRating,
  isInRange,
  isValidNumber,
  getCurrencyInfo,
  getSupportedCurrencies,
  getCurrentNumberFormatInfo,
}
