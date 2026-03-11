// Settings-related types

import type { LucideIcon } from 'lucide-react';

import type { TranslatedString } from '@/lib/i18n';

// ========================================
// Settings Dialog Types
// ========================================

/**
 * 設定カテゴリの識別子（5カテゴリ）
 *
 * 設計思想:
 * - 頻度が高いものを上に配置
 * - 関連する設定をグループ化
 * - 5カテゴリで認知負荷を軽減
 */
export type SettingsCategory =
  | 'general' // 言語、テーマ、タイムゾーン、日付/時間形式、週の開始日
  | 'calendar' // デフォルトビュー、スナップ間隔、週末/週番号表示、睡眠スケジュール
  | 'personalization' // クロノタイプ、ACT価値観、AIコミュニケーションスタイル
  | 'notifications' // 通知設定
  | 'account'; // プロフィール、セキュリティ、連携、データ管理、プラン

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
