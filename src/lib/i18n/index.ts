/**
 * App Router対応の軽量i18n実装
 */

import type { Locale } from '@/types/i18n'

// サポートする言語
export const locales: Locale[] = ['en', 'ja']
export const defaultLocale: Locale = 'en'

// 翻訳辞書の型
type NestedObject = { [key: string]: NestedObject | string }
type Dictionary = Record<string, NestedObject>

// 翻訳辞書の動的インポート
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ja: () => import('./dictionaries/ja.json').then((module) => module.default),
}

// 翻訳辞書取得
export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  if (!locales.includes(locale)) {
    locale = defaultLocale
  }
  return dictionaries[locale]()
}

// ネストしたオブジェクトから値を取得
export const getNestedValue = (obj: NestedObject, path: string): string => {
  const keys = path.split('.')
  let current: NestedObject | string = obj

  for (const key of keys) {
    if (typeof current === 'object' && current && key in current) {
      current = current[key]
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

// 翻訳関数生成
export const createTranslation = (dictionary: Dictionary) => {
  return (key: string, variables?: Record<string, string | number>): string => {
    const translation = getNestedValue(dictionary, key)
    return interpolate(translation, variables)
  }
}
