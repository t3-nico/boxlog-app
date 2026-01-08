import {
  Bell,
  Calendar,
  CreditCard,
  Database,
  Info,
  Settings as SettingsIcon,
  Sliders,
  Tag,
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
 * 設定カテゴリの定義（ChatGPT風7カテゴリ）
 *
 * 設計思想:
 * - 頻度が高いものを上に配置
 * - 関連する設定をグループ化
 * - カテゴリ数は7（認知負荷を軽減）
 *
 * @example
 * const t = useTranslations()
 * const menuItems = SETTINGS_CATEGORIES.map(cat => ({
 *   ...cat,
 *   label: t(cat.labelKey),
 *   description: t(cat.descKey)
 * }))
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
    id: 'tags',
    icon: Tag,
    labelKey: 'settings.dialog.categories.tags',
    descKey: 'settings.dialog.categories.tagsDesc',
  },
  {
    id: 'notifications',
    icon: Bell,
    labelKey: 'settings.dialog.categories.notifications',
    descKey: 'settings.dialog.categories.notificationsDesc',
  },
  {
    id: 'data-controls',
    icon: Database,
    labelKey: 'settings.dialog.categories.dataControls',
    descKey: 'settings.dialog.categories.dataControlsDesc',
  },
  {
    id: 'account',
    icon: User,
    labelKey: 'settings.dialog.categories.account',
    descKey: 'settings.dialog.categories.accountDesc',
  },
  {
    id: 'subscription',
    icon: CreditCard,
    labelKey: 'settings.dialog.categories.subscription',
    descKey: 'settings.dialog.categories.subscriptionDesc',
  },
  {
    id: 'about',
    icon: Info,
    labelKey: 'settings.dialog.categories.about',
    descKey: 'settings.dialog.categories.aboutDesc',
  },
] as const;
