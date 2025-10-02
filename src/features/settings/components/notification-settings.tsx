// @ts-nocheck
// TODO(#389): NotificationSettings型エラーを修正後、@ts-nocheckを削除
'use client'

import { useCallback, useState } from 'react'

import { Bell, BellRing, Settings as SettingsIcon } from 'lucide-react'

import { Switch } from '@/components/shadcn-ui/switch'
import { NotificationsList } from '@/features/notifications/components/notifications-list'
import { cn } from '@/lib/utils'

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { useTranslation } from '@/lib/i18n/hooks'

import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface NotificationAutoSaveSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  browserNotifications: boolean
  weeklyDigest: boolean
  systemNotifications: boolean
}

const NotificationSettings = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list')
  const t = useTranslation()

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

  // Tab navigation handlers
  const handleListTabClick = useCallback(() => {
    setActiveTab('list')
  }, [])

  const handleSettingsTabClick = useCallback(() => {
    setActiveTab('settings')
  }, [])

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
      {/* タブナビゲーション */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleListTabClick}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === 'list'
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          )}
        >
          <BellRing className="h-4 w-4" />
          {t('notifications.settings.tabs.list')}
        </button>
        <button
          type="button"
          onClick={handleSettingsTabClick}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === 'settings'
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          )}
        >
          <SettingsIcon className="h-4 w-4" />
          {t('notifications.settings.tabs.settings')}
        </button>
      </div>

      {/* コンテンツエリア */}
      {activeTab === 'list' ? <NotificationsList /> : null}

      {activeTab === 'settings' ? (
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
                <Switch
                  checked={notifications.values.pushNotifications}
                  onCheckedChange={handlePushNotificationsChange}
                />
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
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">{t('notifications.settings.tip')}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationSettings
