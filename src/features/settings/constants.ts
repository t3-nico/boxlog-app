import {
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Plug,
  Settings as SettingsIcon,
  Sliders,
  Tags,
  Trash2,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react'

import type { SettingsCategory } from './types'

/**
 * 設定カテゴリのメタデータ
 * アイコンと翻訳キーを定義
 */
export interface SettingsCategoryMeta {
  id: SettingsCategory
  icon: LucideIcon
  labelKey: string
  descKey: string
}

/**
 * 設定カテゴリの定義
 *
 * @example
 * // コンポーネントで使用
 * const { t } = useI18n()
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
    id: 'account',
    icon: User,
    labelKey: 'settings.dialog.categories.account',
    descKey: 'settings.dialog.categories.accountDesc',
  },
  {
    id: 'notifications',
    icon: Bell,
    labelKey: 'settings.dialog.categories.notifications',
    descKey: 'settings.dialog.categories.notificationsDesc',
  },
  {
    id: 'calendar',
    icon: Calendar,
    labelKey: 'settings.dialog.categories.calendar',
    descKey: 'settings.dialog.categories.calendarDesc',
  },
  {
    id: 'tags',
    icon: Tags,
    labelKey: 'settings.dialog.categories.tags',
    descKey: 'settings.dialog.categories.tagsDesc',
  },
  {
    id: 'preferences',
    icon: Sliders,
    labelKey: 'settings.dialog.categories.preferences',
    descKey: 'settings.dialog.categories.preferencesDesc',
  },
  {
    id: 'plan-billing',
    icon: CreditCard,
    labelKey: 'settings.dialog.categories.planBilling',
    descKey: 'settings.dialog.categories.planBillingDesc',
  },
  {
    id: 'integration',
    icon: Plug,
    labelKey: 'settings.dialog.categories.integration',
    descKey: 'settings.dialog.categories.integrationDesc',
  },
  {
    id: 'data-export',
    icon: Upload,
    labelKey: 'settings.dialog.categories.dataExport',
    descKey: 'settings.dialog.categories.dataExportDesc',
  },
  {
    id: 'legal',
    icon: FileText,
    labelKey: 'settings.dialog.categories.legal',
    descKey: 'settings.dialog.categories.legalDesc',
  },
  {
    id: 'trash',
    icon: Trash2,
    labelKey: 'settings.dialog.categories.trash',
    descKey: 'settings.dialog.categories.trashDesc',
  },
] as const
