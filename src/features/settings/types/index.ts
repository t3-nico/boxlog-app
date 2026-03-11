// Settings-related types

import type { LucideIcon } from 'lucide-react';

import type { TranslatedString } from '@/lib/i18n';

// ========================================
// Settings Dialog Types
// ========================================

/**
 * 設定カテゴリの識別子（6カテゴリ）
 */
export type SettingsCategory =
  | 'profile' // 名前、メール、クロノタイプ
  | 'display' // テーマ、言語、TZ、時間形式、週開始、デフォルトView/duration
  | 'tags' // タグ一覧、グループ管理
  | 'notifications' // 通知設定
  | 'data' // エクスポート、インポート、全データ削除
  | 'account'; // プラン、ログアウト、アカウント削除

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
