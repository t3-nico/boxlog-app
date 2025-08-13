'use client'

import { useState } from 'react'
import { NotificationsList } from '@/features/notifications/components/notifications-list'
import { Bell, BellRing, Settings as SettingsIcon } from 'lucide-react'

export default function NotificationSettings() {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list')
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    browserNotifications: true,
    weeklyDigest: true,
    systemNotifications: true
  })

  const handleSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <BellRing className="w-4 h-4" />
            お知らせ一覧
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            通知設定
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      {activeTab === 'list' && (
        <NotificationsList />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Bell className="w-5 h-5" />
              通知設定
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              通知の受信方法を設定できます
            </p>
          </div>

          <div className="space-y-6">
            {/* Email通知 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">メール通知</h3>
                <p className="text-sm text-muted-foreground">重要なお知らせをメールで受信</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>

            {/* Push通知 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">プッシュ通知</h3>
                <p className="text-sm text-muted-foreground">モバイルデバイスへのプッシュ通知</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>

            {/* ブラウザ通知 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">ブラウザ通知</h3>
                <p className="text-sm text-muted-foreground">ブラウザでの通知表示</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.browserNotifications}
                onChange={(e) => handleSettingChange('browserNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>

            {/* 週次ダイジェスト */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">週次ダイジェスト</h3>
                <p className="text-sm text-muted-foreground">週単位のアクティビティサマリー</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.weeklyDigest}
                onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>

            {/* システム通知 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">システム通知</h3>
                <p className="text-sm text-muted-foreground">メンテナンス・アップデート情報</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.systemNotifications}
                onChange={(e) => handleSettingChange('systemNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 ヒント: ブラウザ通知を有効にするには、ブラウザの設定で通知を許可してください。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}