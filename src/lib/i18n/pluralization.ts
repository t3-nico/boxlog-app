// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * 高度な複数形処理システム
 * ICU Message Format準拠
 */

import type { Locale } from '@/types/i18n'

// 複数形カテゴリー（CLDR準拠）
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

// 複数形ルールの型定義
export interface PluralRule {
  (count: number): PluralCategory
}

// 複数形翻訳の型定義
export interface PluralTranslation {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string // 必須（フォールバック）
}

// 変数付き複数形翻訳
export interface PluralTranslationWithVariables extends PluralTranslation {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

// 英語の複数形ルール
const englishPluralRule: PluralRule = (count: number): PluralCategory => {
  if (count === 1) return 'one'
  return 'other'
}

// 日本語の複数形ルール（単数・複数の区別なし）
const japanesePluralRule: PluralRule = (_count: number): PluralCategory => {
  return 'other' // 日本語は基本的に複数形の区別がない
}

// アラビア語の複数形ルール（将来実装予定）
const arabicPluralRule: PluralRule = (count: number): PluralCategory => {
  if (count === 0) return 'zero'
  if (count === 1) return 'one'
  if (count === 2) return 'two'
  if (count >= 3 && count <= 10) return 'few'
  if (count >= 11 && count <= 99) return 'many'
  return 'other'
}

// ロシア語の複数形ルール（将来実装予定）
const russianPluralRule: PluralRule = (count: number): PluralCategory => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return 'one'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few'
  return 'many'
}

// 言語別複数形ルールマップ
const pluralRules: Record<string, PluralRule> = {
  en: englishPluralRule,
  ja: japanesePluralRule,
  // 将来実装予定
  ar: arabicPluralRule,
  ru: russianPluralRule,
}

// デフォルトルール（英語）
const defaultPluralRule = englishPluralRule

// 複数形カテゴリーを取得
export const getPluralCategory = (locale: Locale, count: number): PluralCategory => {
  const rule = pluralRules[locale] || defaultPluralRule
  return rule(Math.abs(count)) // 負の数は絶対値で処理
}

// 複数形翻訳を選択
export const selectPluralTranslation = (locale: Locale, count: number, translations: PluralTranslation): string => {
  const category = getPluralCategory(locale, count)

  // 対応するカテゴリーの翻訳を取得、なければ'other'にフォールバック
  return translations[category] || translations.other
}

// 変数補間付き複数形翻訳
export const pluralizeWithVariables = (
  locale: Locale,
  count: number,
  translations: PluralTranslationWithVariables,
  variables?: Record<string, string | number>
): string => {
  const selectedTranslation = selectPluralTranslation(locale, count, translations)

  // 変数補間
  let result = selectedTranslation
  const allVariables = { count, ...variables }

  // {{variable}} 形式の変数を置換
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return allVariables[key]?.toString() || match
  })

  return result
}

// ICU Message Format スタイルの複数形処理
export const formatICUPlural = (
  locale: Locale,
  count: number,
  message: string,
  variables?: Record<string, string | number>
): string => {
  // ICU形式: {count, plural, one {# task} other {# tasks}}
  const pluralRegex = /\{(\w+),\s*plural,\s*([^}]+)\}/g

  return message.replace(pluralRegex, (match, countVar, rules) => {
    const actualCount = countVar === 'count' ? count : (variables?.[countVar] as number) || 0

    // ルールをパース
    const ruleMap: Partial<PluralTranslation> = {}
    const rulePattern = /(\w+)\s*\{([^}]+)\}/g
    let ruleMatch

    while ((ruleMatch = rulePattern.exec(rules)) !== null) {
      const [, category, translation] = ruleMatch
      ruleMap[category as PluralCategory] = translation
    }

    // 'other'がない場合はエラー
    if (!ruleMap.other) {
      console.error(`Missing 'other' category in plural rule: ${match}`)
      return match
    }

    const selectedTranslation = selectPluralTranslation(locale, actualCount, ruleMap as PluralTranslation)

    // #をcountに置換
    return selectedTranslation.replace(/#/g, actualCount.toString())
  })
}

// 時間単位の複数形ヘルパー
export const formatTimeUnit = (
  locale: Locale,
  count: number,
  unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
): string => {
  const timeTranslations: Record<string, PluralTranslation> = {
    second: {
      one: '1 second',
      other: `{{count}} seconds`,
    },
    minute: {
      one: '1 minute',
      other: `{{count}} minutes`,
    },
    hour: {
      one: '1 hour',
      other: `{{count}} hours`,
    },
    day: {
      one: '1 day',
      other: `{{count}} days`,
    },
    week: {
      one: '1 week',
      other: `{{count}} weeks`,
    },
    month: {
      one: '1 month',
      other: `{{count}} months`,
    },
    year: {
      one: '1 year',
      other: `{{count}} years`,
    },
  }

  // 日本語の時間単位翻訳
  const timeTranslationsJa: Record<string, PluralTranslation> = {
    second: { other: '{{count}}秒' },
    minute: { other: '{{count}}分' },
    hour: { other: '{{count}}時間' },
    day: { other: '{{count}}日' },
    week: { other: '{{count}}週間' },
    month: { other: '{{count}}ヶ月' },
    year: { other: '{{count}}年' },
  }

  const translations = locale === 'ja' ? timeTranslationsJa : timeTranslations
  const unitTranslation = translations[unit]

  if (!unitTranslation) {
    return `${count} ${unit}${count !== 1 ? 's' : ''}`
  }

  return pluralizeWithVariables(locale, count, unitTranslation, { count })
}

// ファイルサイズの複数形ヘルパー
export const formatFileSize = (locale: Locale, count: number, unit: 'byte' | 'KB' | 'MB' | 'GB' | 'TB'): string => {
  const sizeTranslations: Record<string, PluralTranslation> = {
    byte: {
      one: '1 byte',
      other: `{{count}} bytes`,
    },
    KB: { other: `{{count}} KB` },
    MB: { other: `{{count}} MB` },
    GB: { other: `{{count}} GB` },
    TB: { other: `{{count}} TB` },
  }

  const sizeTranslationsJa: Record<string, PluralTranslation> = {
    byte: { other: '{{count}}バイト' },
    KB: { other: '{{count}}KB' },
    MB: { other: '{{count}}MB' },
    GB: { other: '{{count}}GB' },
    TB: { other: '{{count}}TB' },
  }

  const translations = locale === 'ja' ? sizeTranslationsJa : sizeTranslations
  const unitTranslation = translations[unit]

  return pluralizeWithVariables(locale, count, unitTranslation, { count })
}

// 一般的なカウンターヘルパー
export const formatCounter = (
  locale: Locale,
  count: number,
  itemType: string,
  translations?: PluralTranslation
): string => {
  if (translations) {
    return pluralizeWithVariables(locale, count, translations, { count })
  }

  // デフォルトの複数形処理
  const defaultTranslations: PluralTranslation = {
    zero: `no ${itemType}s`,
    one: `1 ${itemType}`,
    other: `{{count}} ${itemType}s`,
  }

  const defaultTranslationsJa: PluralTranslation = {
    other: `{{count}}個の${itemType}`,
  }

  const finalTranslations = locale === 'ja' ? defaultTranslationsJa : defaultTranslations
  return pluralizeWithVariables(locale, count, finalTranslations, { count })
}

// 複数形テストヘルパー
export const testPluralRule = (locale: Locale, testCases: number[]): Record<number, PluralCategory> => {
  const results: Record<number, PluralCategory> = {}
  testCases.forEach((count) => {
    results[count] = getPluralCategory(locale, count)
  })
  return results
}

// 複数形ルール一覧を取得
export const getSupportedPluralLocales = (): string[] => {
  return Object.keys(pluralRules)
}

// デバッグ用：複数形ルールの詳細情報
export const getPluralRuleInfo = (locale: Locale) => {
  const testCounts = [0, 1, 2, 3, 5, 11, 21, 101]
  const results = testPluralRule(locale, testCounts)

  return {
    locale,
    hasRule: locale in pluralRules,
    testResults: results,
    categories: Object.values(results).filter((v, i, arr) => arr.indexOf(v) === i),
  }
}
