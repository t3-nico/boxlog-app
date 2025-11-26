'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'

import { AboutLegalSettings as LegalSettings } from '../about-legal-settings'
import { AccountSettings } from '../account-settings'
import { CalendarSettings } from '../calendar-settings'
import { DataExportSettings } from '../data-export-settings'
import { IntegrationSettings } from '../integration-settings'
import { NotificationSettings } from '../notification-settings'
import { PlanBillingSettings } from '../plan-billing-settings'
import { PreferencesSettings } from '../preferences-settings'
import { SettingsLayout } from '../SettingsLayout'
import { TagsSettings } from '../tags-settings'

/**
 * 設定ダイアログのコンテンツ領域
 *
 * 選択されたカテゴリに応じて、適切な設定コンポーネントを表示
 * 既存のページ構造（SettingsLayout）を維持
 */
export function SettingsContent() {
  const { activeCategory, closeSettings } = useSettingsDialogStore()
  const { t } = useI18n()

  // カテゴリごとのtitle/descriptionを取得
  const getCategoryInfo = () => {
    switch (activeCategory) {
      case 'general':
        return {
          title: t('settings.dialog.categories.general'),
          description: t('settings.dialog.categories.generalDesc'),
        }
      case 'account':
        return {
          title: t('settings.dialog.categories.account'),
          description: t('settings.dialog.categories.accountDesc'),
        }
      case 'notifications':
        return {
          title: t('settings.dialog.categories.notifications'),
          description: t('settings.dialog.categories.notificationsDesc'),
        }
      case 'calendar':
        return {
          title: t('settings.dialog.categories.calendar'),
          description: t('settings.dialog.categories.calendarDesc'),
        }
      case 'tags':
        return {
          title: t('settings.dialog.categories.tags'),
          description: t('settings.dialog.categories.tagsDesc'),
        }
      case 'preferences':
        return {
          title: t('settings.dialog.categories.preferences'),
          description: t('settings.dialog.categories.preferencesDesc'),
        }
      case 'plan-billing':
        return {
          title: t('settings.dialog.categories.planBilling'),
          description: t('settings.dialog.categories.planBillingDesc'),
        }
      case 'integration':
        return {
          title: t('settings.dialog.categories.integration'),
          description: t('settings.dialog.categories.integrationDesc'),
        }
      case 'data-export':
        return {
          title: t('settings.dialog.categories.dataExport'),
          description: t('settings.dialog.categories.dataExportDesc'),
        }
      case 'legal':
        return {
          title: t('settings.dialog.categories.legal'),
          description: t('settings.dialog.categories.legalDesc'),
        }
      case 'trash':
        return {
          title: t('settings.dialog.categories.trash'),
          description: t('settings.dialog.categories.trashDesc'),
        }
      default:
        return { title: '', description: '' }
    }
  }

  const { title, description } = getCategoryInfo()

  const closeButton = (
    <Button variant="ghost" size="icon" onClick={closeSettings} className="h-8 w-8">
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  )

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <SettingsLayout title={title} description={description} actions={closeButton}>
        {activeCategory === 'general' && <div>General Settings (Coming Soon)</div>}
        {activeCategory === 'account' && <AccountSettings />}
        {activeCategory === 'notifications' && <NotificationSettings />}
        {activeCategory === 'calendar' && <CalendarSettings />}
        {activeCategory === 'tags' && <TagsSettings />}
        {activeCategory === 'preferences' && <PreferencesSettings />}
        {activeCategory === 'plan-billing' && <PlanBillingSettings />}
        {activeCategory === 'integration' && <IntegrationSettings />}
        {activeCategory === 'data-export' && <DataExportSettings />}
        {activeCategory === 'legal' && <LegalSettings />}
        {activeCategory === 'trash' && <div>Trash Settings (Coming Soon)</div>}
      </SettingsLayout>
    </main>
  )
}
