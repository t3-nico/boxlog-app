// Settings-related types

import type { LucideIcon } from 'lucide-react';

import type { SettingsCategory } from '@/core/types';

import type { TranslatedString } from '@/lib/i18n';

// ========================================
// Settings Dialog Types
// ========================================

// SettingsCategory は @/core/types/settings.ts で定義（複数featureから参照されるため）
export type { SettingsCategory };

/**
 * 設定セクションの識別子（スクロールターゲット用）
 */
export type SettingsSectionId =
  | 'calendar' // カレンダー設定
  | 'chronotype'; // クロノタイプ設定

/**
 * 設定メニュー項目
 */
export interface SettingsMenuItem {
  id: SettingsCategory;
  icon: LucideIcon;
  label: TranslatedString;
  description?: TranslatedString;
}

// ========================================
// Individual Settings Types
// ========================================

export interface CalendarSettingsData {
  timezone: string;
  weekStartDay: number;
  timeFormat: '12h' | '24h';
  defaultView: 'month' | 'week' | 'day';
  showWeekends: boolean;
  showAllDayEvents: boolean;
}

export interface NotificationSettingsData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderMinutes: number[];
  weeklyDigest: boolean;
}

export interface PreferencesSettingsData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  chronotype: 'morning' | 'evening' | 'intermediate';
  dateFormat: string;
}
