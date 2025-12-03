/**
 * i18n型定義
 */

import type { Locale } from '@/types/i18n'

export type { Locale }

// ネストしたオブジェクト型
export type NestedObject = { [key: string]: NestedObject | string }

// 辞書型
export type Dictionary = Record<string, NestedObject>

// ネームスペース定義
export type Namespace =
  | 'common'
  | 'navigation'
  | 'calendar'
  | 'settings'
  | 'auth'
  | 'notifications'
  | 'tags'
  | 'errors'
  | 'legal'
  | 'help'
  | 'features'

// 全ネームスペースのリスト
export const ALL_NAMESPACES: Namespace[] = [
  'common',
  'navigation',
  'calendar',
  'settings',
  'auth',
  'notifications',
  'tags',
  'errors',
  'legal',
  'help',
  'features',
]

// サポートする言語
export const locales: Locale[] = ['en', 'ja']
export const defaultLocale: Locale = 'en'

// 複数形翻訳の型
export interface PluralTranslation {
  zero?: string
  one: string
  two?: string
  few?: string
  many?: string
  other: string
}
