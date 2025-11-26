'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'

import { AboutLegalSettings } from '../about-legal-settings'
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
 * ChatGPT風7カテゴリ構成:
 * - General: 言語、テーマ、起動画面
 * - Personalization: カレンダー、タグ
 * - Notifications: 通知設定
 * - Data controls: エクスポート、連携
 * - Account: プロフィール、セキュリティ
 * - Subscription: プラン、課金
 * - About: 法的情報、バージョン
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
      case 'personalization':
        return {
          title: t('settings.dialog.categories.personalization'),
          description: t('settings.dialog.categories.personalizationDesc'),
        }
      case 'notifications':
        return {
          title: t('settings.dialog.categories.notifications'),
          description: t('settings.dialog.categories.notificationsDesc'),
        }
      case 'data-controls':
        return {
          title: t('settings.dialog.categories.dataControls'),
          description: t('settings.dialog.categories.dataControlsDesc'),
        }
      case 'account':
        return {
          title: t('settings.dialog.categories.account'),
          description: t('settings.dialog.categories.accountDesc'),
        }
      case 'subscription':
        return {
          title: t('settings.dialog.categories.subscription'),
          description: t('settings.dialog.categories.subscriptionDesc'),
        }
      case 'about':
        return {
          title: t('settings.dialog.categories.about'),
          description: t('settings.dialog.categories.aboutDesc'),
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
        {/* General: 言語、テーマ、起動画面（既存のPreferencesSettingsを再利用） */}
        {activeCategory === 'general' && <PreferencesSettings />}

        {/* Personalization: カレンダー + タグ */}
        {activeCategory === 'personalization' && (
          <div className="space-y-8">
            <CalendarSettings />
            <TagsSettings />
          </div>
        )}

        {/* Notifications: 通知設定 */}
        {activeCategory === 'notifications' && <NotificationSettings />}

        {/* Data controls: エクスポート + 連携 */}
        {activeCategory === 'data-controls' && (
          <div className="space-y-8">
            <DataExportSettings />
            <IntegrationSettings />
          </div>
        )}

        {/* Account: プロフィール、セキュリティ */}
        {activeCategory === 'account' && <AccountSettings />}

        {/* Subscription: プラン、課金 */}
        {activeCategory === 'subscription' && <PlanBillingSettings />}

        {/* About: 法的情報、バージョン */}
        {activeCategory === 'about' && <AboutLegalSettings />}
      </SettingsLayout>
    </main>
  )
}
