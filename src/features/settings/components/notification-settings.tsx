'use client'

import { useCallback } from 'react'

import { Bell } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'

import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface NotificationAutoSaveSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  browserNotifications: boolean
  weeklyDigest: boolean
  systemNotifications: boolean
}

export function NotificationSettings() {
  const { t } = useI18n()

  // 通知設定の自動保存
  const notifications = useAutoSaveSettings<NotificationAutoSaveSettings>({
    initialValues: {
      emailNotifications: true,
      pushNotifications: false,
      browserNotifications: true,
      weeklyDigest: true,
      systemNotifications: true,
    },
    onSave: async (values) => {
      // 通知設定API呼び出しシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('Saving notification settings:', values)
    },
    successMessage: t('notifications.settings.saveSuccess'),
    debounceMs: 800,
  })

  // Notification settings handlers
  const handleEmailNotificationsChange = useCallback(
    (checked: boolean) => {
      notifications.updateValue('emailNotifications', checked)
    },
    [notifications]
  )

  const handlePushNotificationsChange = useCallback(
    (checked: boolean) => {
      notifications.updateValue('pushNotifications', checked)
    },
    [notifications]
  )

  const handleBrowserNotificationsChange = useCallback(
    (checked: boolean) => {
      notifications.updateValue('browserNotifications', checked)
    },
    [notifications]
  )

  const handleWeeklyDigestChange = useCallback(
    (checked: boolean) => {
      notifications.updateValue('weeklyDigest', checked)
    },
    [notifications]
  )

  const handleSystemNotificationsChange = useCallback(
    (checked: boolean) => {
      notifications.updateValue('systemNotifications', checked)
    },
    [notifications]
  )

  return (
    <div className="space-y-6">
      {/* メール・プッシュ通知 */}
      <SettingsCard
        title={
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>{t('notifications.settings.deliverySettings.title')}</span>
          </div>
        }
        description={t('notifications.settings.deliverySettings.description')}
        isSaving={notifications.isSaving}
      >
        <div className="space-y-4">
          <SettingField
            label={t('notifications.settings.deliverySettings.email.label')}
            description={t('notifications.settings.deliverySettings.email.description')}
          >
            <Switch
              checked={notifications.values.emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </SettingField>

          <SettingField
            label={t('notifications.settings.deliverySettings.push.label')}
            description={t('notifications.settings.deliverySettings.push.description')}
          >
            <Switch checked={notifications.values.pushNotifications} onCheckedChange={handlePushNotificationsChange} />
          </SettingField>

          <SettingField
            label={t('notifications.settings.deliverySettings.browser.label')}
            description={t('notifications.settings.deliverySettings.browser.description')}
          >
            <Switch
              checked={notifications.values.browserNotifications}
              onCheckedChange={handleBrowserNotificationsChange}
            />
          </SettingField>
        </div>
      </SettingsCard>

      {/* コンテンツ通知 */}
      <SettingsCard
        title={t('notifications.settings.contentSettings.title')}
        description={t('notifications.settings.contentSettings.description')}
        isSaving={notifications.isSaving}
      >
        <div className="space-y-4">
          <SettingField
            label={t('notifications.settings.contentSettings.weeklyDigest.label')}
            description={t('notifications.settings.contentSettings.weeklyDigest.description')}
          >
            <Switch checked={notifications.values.weeklyDigest} onCheckedChange={handleWeeklyDigestChange} />
          </SettingField>

          <SettingField
            label={t('notifications.settings.contentSettings.system.label')}
            description={t('notifications.settings.contentSettings.system.description')}
          >
            <Switch
              checked={notifications.values.systemNotifications}
              onCheckedChange={handleSystemNotificationsChange}
            />
          </SettingField>
        </div>
      </SettingsCard>

      {/* ヒント情報 */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <p className="text-sm text-blue-700 dark:text-blue-300">{t('notifications.settings.tip')}</p>
      </div>
    </div>
  )
}
