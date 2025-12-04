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
    successMessage: t('notification.settings.saveSuccess'),
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
            <span>{t('notification.settings.deliverySettings.title')}</span>
          </div>
        }
        isSaving={notifications.isSaving}
      >
        <div className="space-y-4">
          <SettingField
            label={t('notification.settings.deliverySettings.email.label')}
            description={t('notification.settings.deliverySettings.email.description')}
          >
            <Switch
              checked={notifications.values.emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </SettingField>

          <SettingField
            label={t('notification.settings.deliverySettings.push.label')}
            description={t('notification.settings.deliverySettings.push.description')}
          >
            <Switch checked={notifications.values.pushNotifications} onCheckedChange={handlePushNotificationsChange} />
          </SettingField>

          <SettingField
            label={t('notification.settings.deliverySettings.browser.label')}
            description={t('notification.settings.deliverySettings.browser.description')}
          >
            <Switch
              checked={notifications.values.browserNotifications}
              onCheckedChange={handleBrowserNotificationsChange}
            />
          </SettingField>
        </div>
      </SettingsCard>

      {/* コンテンツ通知 */}
      <SettingsCard title={t('notification.settings.contentSettings.title')} isSaving={notifications.isSaving}>
        <div className="space-y-4">
          <SettingField
            label={t('notification.settings.contentSettings.weeklyDigest.label')}
            description={t('notification.settings.contentSettings.weeklyDigest.description')}
          >
            <Switch checked={notifications.values.weeklyDigest} onCheckedChange={handleWeeklyDigestChange} />
          </SettingField>

          <SettingField
            label={t('notification.settings.contentSettings.system.label')}
            description={t('notification.settings.contentSettings.system.description')}
          >
            <Switch
              checked={notifications.values.systemNotifications}
              onCheckedChange={handleSystemNotificationsChange}
            />
          </SettingField>
        </div>
      </SettingsCard>

      {/* ヒント情報 */}
      <div className="bg-muted/50 border-border rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">{t('notification.settings.tip')}</p>
      </div>
    </div>
  )
}
