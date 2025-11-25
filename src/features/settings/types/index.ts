// Settings-related types

import type { LucideIcon } from 'lucide-react'

import type { TranslatedString } from '@/types/i18n-branded'

// ========================================
// Settings Dialog Types
// ========================================

/**
 * 設定カテゴリの識別子
 */
export type SettingsCategory =
  | 'general'
  | 'account'
  | 'notifications'
  | 'calendar'
  | 'tags'
  | 'preferences'
  | 'plan-billing'
  | 'integration'
  | 'data-export'
  | 'legal'
  | 'trash'

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
