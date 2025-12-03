/**
 * App Router対応の軽量i18n実装
 * ネームスペースベースの動的ローディング対応
 */

import type { TranslatedString } from '@/types/i18n-branded'
import { markAsTranslated } from '@/types/i18n-branded'

import type { Dictionary, Locale, Namespace, NestedObject, PluralTranslation } from './types'
import { ALL_NAMESPACES, defaultLocale, locales } from './types'

export type { Dictionary, Locale, Namespace, NestedObject, PluralTranslation }
export { ALL_NAMESPACES, defaultLocale, locales }

// 辞書キャッシュ（ネームスペース別）
const dictionaryCache: Record<Locale, Record<Namespace, NestedObject | null>> = {
  en: {} as Record<Namespace, NestedObject | null>,
  ja: {} as Record<Namespace, NestedObject | null>,
}

// マージされた辞書キャッシュ（後方互換性用）
const mergedDictionaryCache: Record<Locale, Dictionary | null> = {
  en: null,
  ja: null,
}

/**
 * 単一ネームスペースの辞書を動的にロード
 */
export async function loadNamespace(locale: Locale, namespace: Namespace): Promise<NestedObject> {
  // キャッシュチェック
  if (dictionaryCache[locale][namespace]) {
    return dictionaryCache[locale][namespace]!
  }

  try {
    const dict = await import(`@/dictionaries/${locale}/${namespace}.json`).then((m) => m.default)
    dictionaryCache[locale][namespace] = dict
    return dict
  } catch (error) {
    console.warn(`Failed to load namespace ${namespace} for locale ${locale}:`, error)
    // フォールバック：デフォルト言語を試す
    if (locale !== defaultLocale) {
      return loadNamespace(defaultLocale, namespace)
    }
    return {}
  }
}

/**
 * 複数ネームスペースの辞書をロード
 */
export async function loadNamespaces(locale: Locale, namespaces: Namespace[]): Promise<Dictionary> {
  const results = await Promise.all(namespaces.map((ns) => loadNamespace(locale, ns)))

  const merged: Dictionary = {}
  namespaces.forEach((_ns, index) => {
    const nsData = results[index]
    // ネームスペースの内容をトップレベルキーとしてマージ
    Object.assign(merged, nsData)
  })

  return merged
}

/**
 * 全ネームスペースの辞書を取得（後方互換性用）
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (!locales.includes(locale)) {
    locale = defaultLocale
  }

  // マージ済みキャッシュがあれば使用
  if (mergedDictionaryCache[locale]) {
    return mergedDictionaryCache[locale]!
  }

  const dict = await loadNamespaces(locale, ALL_NAMESPACES)
  mergedDictionaryCache[locale] = dict
  return dict
}

/**
 * 同期的に辞書を取得（キャッシュから）
 */
export function getCachedDictionary(locale: Locale): Dictionary | null {
  if (!locales.includes(locale)) {
    locale = defaultLocale
  }
  return mergedDictionaryCache[locale]
}

/**
 * 全ネームスペースをプリロード
 */
export async function preloadDictionaries(): Promise<void> {
  await Promise.all(locales.map((locale) => getDictionary(locale)))
}

/**
 * 特定のネームスペースをプリロード
 */
export async function preloadNamespaces(namespaces: Namespace[]): Promise<void> {
  await Promise.all(locales.flatMap((locale) => namespaces.map((ns) => loadNamespace(locale, ns))))
}

// ネストしたオブジェクトから値を取得
export function getNestedValue(obj: NestedObject, path: string): string {
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
export function interpolate(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() || match
  })
}

// ブラウザの言語検出
export function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language.split('-')[0] as Locale
  return locales.includes(browserLang) ? browserLang : defaultLocale
}

// Cookie管理
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE}=([^;]+)`))
  const cookieLocale = match ? (match[2] as Locale) : null

  return cookieLocale && locales.includes(cookieLocale) ? cookieLocale : null
}

// 複数形処理（シンプル版）
export function getPluralCategory(locale: Locale, count: number): 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' {
  const absCount = Math.abs(count)
  if (locale === 'ja') {
    return 'other' // 日本語は複数形の区別なし
  }
  // 英語
  if (absCount === 1) return 'one'
  return 'other'
}

export function selectPluralTranslation(locale: Locale, count: number, translations: PluralTranslation): string {
  const category = getPluralCategory(locale, count)
  return translations[category] || translations.other
}

export function pluralizeWithVariables(
  locale: Locale,
  count: number,
  translations: PluralTranslation,
  variables?: Record<string, string | number>
): string {
  const selected = selectPluralTranslation(locale, count, translations)
  return interpolate(selected, { count, ...variables })
}

// ICU Message Format処理
export function formatICUPlural(
  locale: Locale,
  count: number,
  message: string,
  variables?: Record<string, string | number>
): string {
  const pluralRegex = /\{(\w+),\s*plural,\s*([^}]+)\}/g

  return message.replace(pluralRegex, (match, countVar, rules) => {
    const actualCount = countVar === 'count' ? count : (variables?.[countVar] as number) || 0

    const ruleMap: Partial<PluralTranslation> = {}
    const rulePattern = /(\w+)\s*\{([^}]+)\}/g
    let ruleMatch

    while ((ruleMatch = rulePattern.exec(rules)) !== null) {
      const [, category, translation] = ruleMatch
      if (category && translation) {
        ruleMap[category as keyof PluralTranslation] = translation
      }
    }

    if (!ruleMap.other) {
      console.error(`Missing 'other' category in plural rule: ${match}`)
      return match
    }

    const selectedTranslation = selectPluralTranslation(locale, actualCount, ruleMap as PluralTranslation)
    return selectedTranslation.replace(/#/g, actualCount.toString())
  })
}

// 拡張翻訳関数の型定義
export interface TranslationFunction {
  (key: string, variables?: Record<string, string | number>): TranslatedString
  plural: (key: string, count: number, variables?: Record<string, string | number>) => TranslatedString
  icu: (message: string, count: number, variables?: Record<string, string | number>) => TranslatedString
}

// 翻訳関数生成
export function createTranslation(dictionary: Dictionary, locale: Locale = defaultLocale): TranslationFunction {
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
  const pluralTranslation = (key: string, count: number, variables?: Record<string, string | number>): TranslatedString => {
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
  const icuTranslation = (message: string, count: number, variables?: Record<string, string | number>): TranslatedString => {
    return markAsTranslated(formatICUPlural(locale, count, message, variables))
  }

  // 関数にメソッドを追加
  const translationFunction = baseTranslation as TranslationFunction
  translationFunction.plural = pluralTranslation
  translationFunction.icu = icuTranslation

  return translationFunction
}

// レガシー互換性のためのシンプル翻訳関数
export function createSimpleTranslation(dictionary: Dictionary) {
  return (key: string, variables?: Record<string, string | number>): TranslatedString => {
    const translation = getNestedValue(dictionary, key)
    return markAsTranslated(interpolate(translation, variables))
  }
}
