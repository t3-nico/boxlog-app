import {
  Bell,
  Calendar,
  Settings as SettingsIcon,
  Sliders,
  User,
  type LucideIcon,
} from 'lucide-react';

import type { SettingsCategory } from './types';

/**
 * 設定カテゴリのメタデータ
 * アイコンと翻訳キーを定義
 */
export interface SettingsCategoryMeta {
  id: SettingsCategory;
  icon: LucideIcon;
  labelKey: string;
  descKey: string;
}

/**
 * 設定カテゴリの定義（5カテゴリ）
 *
 * 設計思想:
 * - 頻度が高いものを上に配置
 * - 関連する設定をグループ化
 * - 5カテゴリで認知負荷を軽減
 */
export const SETTINGS_CATEGORIES: readonly SettingsCategoryMeta[] = [
  {
    id: 'general',
    icon: SettingsIcon,
    labelKey: 'settings.dialog.categories.general',
    descKey: 'settings.dialog.categories.generalDesc',
  },
  {
    id: 'calendar',
    icon: Calendar,
    labelKey: 'settings.dialog.categories.calendar',
    descKey: 'settings.dialog.categories.calendarDesc',
  },
  {
    id: 'personalization',
    icon: Sliders,
    labelKey: 'settings.dialog.categories.personalization',
    descKey: 'settings.dialog.categories.personalizationDesc',
  },
  {
    id: 'notifications',
    icon: Bell,
    labelKey: 'settings.dialog.categories.notifications',
    descKey: 'settings.dialog.categories.notificationsDesc',
  },
  {
    id: 'account',
    icon: User,
    labelKey: 'settings.dialog.categories.account',
    descKey: 'settings.dialog.categories.accountDesc',
  },
] as const;
