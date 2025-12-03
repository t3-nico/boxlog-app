/**
 * App Router対応の軽量i18n実装
 */

import type { Locale } from '@/types/i18n'
import type { TranslatedString } from '@/types/i18n-branded'
import { markAsTranslated } from '@/types/i18n-branded'

// 翻訳辞書の静的インポート（gzip圧縮後は約10-15KB、遷移時のフラッシュ防止）
import enDict from './dictionaries/en.json'
import jaDict from './dictionaries/ja.json'
import type { PluralTranslation } from './pluralization'
import { formatICUPlural, pluralizeWithVariables } from './pluralization'

// サポートする言語
export const locales: Locale[] = ['en', 'ja']
export const defaultLocale: Locale = 'en'

// 翻訳辞書の型
export type NestedObject = { [key: string]: NestedObject | string }
export type Dictionary = Record<string, NestedObject>

// 静的辞書マップ（同期アクセス可能）
const staticDictionaries: Record<Locale, Dictionary> = {
  en: enDict as unknown as Dictionary,
  ja: jaDict as unknown as Dictionary,
}

// 翻訳辞書取得（同期版 - 互換性のためasyncを維持）
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  if (!locales.includes(locale)) {
    locale = defaultLocale
  }
  return staticDictionaries[locale] ?? staticDictionaries[defaultLocale]
}

// 同期的に辞書を取得（常に成功）
export const getCachedDictionary = (locale: Locale): Dictionary | null => {
  if (!locales.includes(locale)) {
    locale = defaultLocale
  }
  return staticDictionaries[locale] ?? staticDictionaries[defaultLocale]
}

// プリロード（静的インポートなので何もしない - 互換性のため維持）
export const preloadDictionaries = (): Promise<void> => Promise.resolve()

// ネストしたオブジェクトから値を取得
export const getNestedValue = (obj: NestedObject, path: string): string => {
  const keys = path.split('.')
  let current: NestedObject | string = obj

  for (const key of keys) {
    if (typeof current === 'object' && current && key in current) {
      current = current[key] as NestedObject | string
    } else {
      return path // キーが見つからない場合はパスをそのまま返す
    }
  }

  return typeof current === 'string' ? current : path
}

// シンプルな変数補間
export const interpolate = (text: string, variables?: Record<string, string | number>): string => {
  if (!variables) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() || match
  })
}

// ブラウザの言語検出
export const detectBrowserLanguage = (): Locale => {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language.split('-')[0] as Locale
  return locales.includes(browserLang) ? browserLang : defaultLocale
}

// Cookie管理
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const setLocaleCookie = (locale: Locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export const getLocaleCookie = (): Locale | null => {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE}=([^;]+)`))
  const cookieLocale = match ? (match[2] as Locale) : null

  return cookieLocale && locales.includes(cookieLocale) ? cookieLocale : null
}

// 拡張翻訳関数の型定義
export interface TranslationFunction {
  (key: string, variables?: Record<string, string | number>): TranslatedString
  plural: (key: string, count: number, variables?: Record<string, string | number>) => TranslatedString
  icu: (message: string, count: number, variables?: Record<string, string | number>) => TranslatedString
}

// 翻訳関数生成（複数形処理対応）
export const createTranslation = (dictionary: Dictionary, locale: Locale = defaultLocale): TranslationFunction => {
  const baseTranslation = (key: string, variables?: Record<string, string | number>): TranslatedString => {
    const translation = getNestedValue(dictionary, key)

    // ICU Message Format形式の検出と処理
    if (translation.includes('{') && translation.includes('plural')) {
      const count = (variables?.count as number) || 0
      return markAsTranslated(formatICUPlural(locale, count, translation, variables))
    }

    return markAsTranslated(interpolate(translation, variables))
  }

  // 複数形処理関数
  const pluralTranslation = (
    key: string,
    count: number,
    variables?: Record<string, string | number>
  ): TranslatedString => {
    const translation = getNestedValue(dictionary, key)

    // オブジェクト形式の複数形翻訳をチェック
    if (typeof translation === 'object') {
      try {
        const pluralTranslations = JSON.parse(JSON.stringify(translation)) as PluralTranslation
        return markAsTranslated(pluralizeWithVariables(locale, count, pluralTranslations, variables))
      } catch {
        // JSONパースに失敗した場合は通常の翻訳として処理
      }
    }

    // 文字列の場合は通常の変数補間
    return markAsTranslated(interpolate(translation, { count, ...variables }))
  }

  // ICU形式直接処理関数
  const icuTranslation = (
    message: string,
    count: number,
    variables?: Record<string, string | number>
  ): TranslatedString => {
    return markAsTranslated(formatICUPlural(locale, count, message, variables))
  }

  // 関数にメソッドを追加
  const translationFunction = baseTranslation as TranslationFunction
  translationFunction.plural = pluralTranslation
  translationFunction.icu = icuTranslation

  return translationFunction
}

// レガシー互換性のためのシンプル翻訳関数
export const createSimpleTranslation = (dictionary: Dictionary) => {
  return (key: string, variables?: Record<string, string | number>): TranslatedString => {
    const translation = getNestedValue(dictionary, key)
    return markAsTranslated(interpolate(translation, variables))
  }
}

// 複数形対応の型定義をエクスポート
export type { PluralTranslation }

// 複数形処理のヘルパー関数をエクスポート
export { formatICUPlural, pluralizeWithVariables, selectPluralTranslation } from './pluralization'
