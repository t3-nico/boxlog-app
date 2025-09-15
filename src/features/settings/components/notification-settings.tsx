'use client'

import { useState } from 'react'

import { Bell, BellRing, Settings as SettingsIcon } from 'lucide-react'

import { Switch } from '@/components/shadcn-ui/switch'
import { colors, spacing, typography } from '@/config/theme'
import { NotificationsList } from '@/features/notifications/components/notifications-list'
import { SettingsCard } from './SettingsCard'
import { SettingField } from './fields/SettingField'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'

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
      systemNotifications: true
    },
    onSave: async (values) => {
      // 通知設定API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Saving notification settings:', values)
    },
    successMessage: '通知設定を保存しました',
    debounceMs: 800
  })

  return (
    <div className={spacing.stackGap.lg}>
      {/* タブナビゲーション */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? `${colors.primary.light} ${colors.primary.text}`
              : `${colors.text.secondary} hover:${colors.text.primary}`
          }`}
        >
          <BellRing className="w-4 h-4" />
          お知らせ一覧
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? `${colors.primary.light} ${colors.primary.text}`
              : `${colors.text.secondary} hover:${colors.text.primary}`
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          通知設定
        </button>
      </div>

      {/* コンテンツエリア */}
      {activeTab === 'list' && (
        <NotificationsList />
      )}

      {activeTab === 'settings' && (
        <div className={spacing.stackGap.lg}>
          {/* メール・プッシュ通知 */}
          <SettingsCard
            title={
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
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
                  onCheckedChange={(checked) => notifications.updateValue('emailNotifications', checked)}
                />
              </SettingField>

              <SettingField label="プッシュ通知" description="モバイルデバイスへのプッシュ通知">
                <Switch
                  checked={notifications.values.pushNotifications}
                  onCheckedChange={(checked) => notifications.updateValue('pushNotifications', checked)}
                />
              </SettingField>

              <SettingField label="ブラウザ通知" description="ブラウザでの通知表示">
                <Switch
                  checked={notifications.values.browserNotifications}
                  onCheckedChange={(checked) => notifications.updateValue('browserNotifications', checked)}
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
                <Switch
                  checked={notifications.values.weeklyDigest}
                  onCheckedChange={(checked) => notifications.updateValue('weeklyDigest', checked)}
                />
              </SettingField>

              <SettingField label="システム通知" description="メンテナンス・アップデート情報を受信">
                <Switch
                  checked={notifications.values.systemNotifications}
                  onCheckedChange={(checked) => notifications.updateValue('systemNotifications', checked)}
                />
              </SettingField>
            </div>
          </SettingsCard>

          {/* ヒント情報 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className={`text-sm text-blue-800 dark:text-blue-200 ${typography.body.sm}`}>
              💡 ヒント: ブラウザ通知を有効にするには、ブラウザの設定で通知を許可してください。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationSettings