import {
  Bell,
  CreditCard,
  Database,
  Monitor,
  Settings as SettingsIcon,
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
 * 設定カテゴリの定義（6カテゴリ）
 */
export const SETTINGS_CATEGORIES: readonly SettingsCategoryMeta[] = [
  {
    id: 'profile',
    icon: User,
    labelKey: 'settings.dialog.categories.profile',
    descKey: 'settings.dialog.categories.profileDesc',
  },
  {
    id: 'display',
    icon: Monitor,
    labelKey: 'settings.dialog.categories.display',
    descKey: 'settings.dialog.categories.displayDesc',
  },
  {
    id: 'notifications',
    icon: Bell,
    labelKey: 'settings.dialog.categories.notifications',
    descKey: 'settings.dialog.categories.notificationsDesc',
  },
  {
    id: 'data',
    icon: Database,
    labelKey: 'settings.dialog.categories.data',
    descKey: 'settings.dialog.categories.dataDesc',
  },
  {
    id: 'billing',
    icon: CreditCard,
    labelKey: 'settings.dialog.categories.billing',
    descKey: 'settings.dialog.categories.billingDesc',
  },
  {
    id: 'account',
    icon: SettingsIcon,
    labelKey: 'settings.dialog.categories.account',
    descKey: 'settings.dialog.categories.accountDesc',
  },
] as const;
