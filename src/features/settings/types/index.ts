// Settings-related types

import type { LucideIcon } from 'lucide-react'

import type { TranslatedString } from '@/lib/i18n'

// ========================================
// Settings Dialog Types
// ========================================

/**
 * 設定カテゴリの識別子（ChatGPT風7カテゴリ）
 *
 * 設計思想:
 * - 頻度が高いものを上に配置
 * - 関連する設定をグループ化
 * - カテゴリ数は7（認知負荷を軽減）
 */
export type SettingsCategory =
  | 'general' // 言語、テーマ、起動画面
  | 'personalization' // カレンダー、タグ
  | 'notifications' // 通知設定
  | 'data-controls' // エクスポート、連携
  | 'account' // プロフィール、セキュリティ
  | 'subscription' // プラン、課金
  | 'about' // 法的情報、バージョン

/**
 * 設定セクションの識別子（スクロールターゲット用）
 */
export type SettingsSectionId =
  | 'calendar' // カレンダー設定
  | 'chronotype' // クロノタイプ設定
  | 'tags' // タグ設定

/**
 * 設定メニュー項目
 */
export interface SettingsMenuItem {
  id: SettingsCategory
  icon: LucideIcon
  label: TranslatedString
  description?: TranslatedString
}

// ========================================
// Individual Settings Types
// ========================================

export interface CalendarSettingsData {
  timezone: string
  weekStartDay: number
  timeFormat: '12h' | '24h'
  defaultView: 'month' | 'week' | 'day'
  showWeekends: boolean
  showAllDayEvents: boolean
}

export interface NotificationSettingsData {
  emailNotifications: boolean
  pushNotifications: boolean
  reminderMinutes: number[]
  weeklyDigest: boolean
}

export interface PreferencesSettingsData {
  theme: 'light' | 'dark' | 'system'
  language: string
  chronotype: 'morning' | 'evening' | 'intermediate'
  dateFormat: string
}

export interface IntegrationSettingsData {
  googleCalendar: boolean
  outlook: boolean
  slack: boolean
  zapier: boolean
}

/**
 * @deprecated Use SettingsMenuItem instead
 */
export interface SettingsSection {
  id: string
  title: string
  description?: string
  icon?: string
  href: string
}
