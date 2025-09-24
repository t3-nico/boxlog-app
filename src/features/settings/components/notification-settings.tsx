'use client'

import { useCallback, useState } from 'react'

import { Bell, BellRing, Settings as SettingsIcon } from 'lucide-react'

import { Switch } from '@/components/shadcn-ui/switch'
import { colors, rounded, semantic, spacing, typography } from '@/config/theme'
import { NotificationsList } from '@/features/notifications/components/notifications-list'

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

const NotificationSettings = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list')

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
    successMessage: '通知設定を保存しました',
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
    <div className={spacing.stackGap.lg}>
      {/* タブナビゲーション */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleListTabClick}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? `${colors.primary.light} ${colors.primary.text}`
              : `${colors.text.secondary} hover:${colors.text.primary}`
          }`}
        >
          <BellRing className="h-4 w-4" />
          お知らせ一覧
        </button>
        <button
          type="button"
          onClick={handleSettingsTabClick}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? `${colors.primary.light} ${colors.primary.text}`
              : `${colors.text.secondary} hover:${colors.text.primary}`
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          通知設定
        </button>
      </div>

      {/* コンテンツエリア */}
      {activeTab === 'list' ? <NotificationsList /> : null}

      {activeTab === 'settings' ? (
        <div className={spacing.stackGap.lg}>
          {/* メール・プッシュ通知 */}
          <SettingsCard
            title={
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>通知配信設定</span>
              </div>
            }
            description="メール、プッシュ、ブラウザ通知の設定"
            isSaving={notifications.isSaving}
          >
            <div className={spacing.stackGap.md}>
              <SettingField label="メール通知" description="重要なお知らせをメールで受信">
                <Switch
                  checked={notifications.values.emailNotifications}
                  onCheckedChange={handleEmailNotificationsChange}
                />
              </SettingField>

              <SettingField label="プッシュ通知" description="モバイルデバイスへのプッシュ通知">
                <Switch
                  checked={notifications.values.pushNotifications}
                  onCheckedChange={handlePushNotificationsChange}
                />
              </SettingField>

              <SettingField label="ブラウザ通知" description="ブラウザでの通知表示">
                <Switch
                  checked={notifications.values.browserNotifications}
                  onCheckedChange={handleBrowserNotificationsChange}
                />
              </SettingField>
            </div>
          </SettingsCard>

          {/* コンテンツ通知 */}
          <SettingsCard
            title="コンテンツ通知"
            description="定期的な情報配信とシステム通知"
            isSaving={notifications.isSaving}
          >
            <div className={spacing.stackGap.md}>
              <SettingField label="週次ダイジェスト" description="週単位のアクティビティサマリーをメールで配信">
                <Switch checked={notifications.values.weeklyDigest} onCheckedChange={handleWeeklyDigestChange} />
              </SettingField>

              <SettingField label="システム通知" description="メンテナンス・アップデート情報を受信">
                <Switch
                  checked={notifications.values.systemNotifications}
                  onCheckedChange={handleSystemNotificationsChange}
                />
              </SettingField>
            </div>
          </SettingsCard>

          {/* ヒント情報 */}
          <div className={`${rounded.component.card.lg} ${semantic.info.light} ${spacing.card}`}>
            <p className={`${typography.body.sm} ${semantic.info.text}`}>
              💡 ヒント: ブラウザ通知を有効にするには、ブラウザの設定で通知を許可してください。
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationSettings
