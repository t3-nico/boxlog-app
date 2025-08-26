'use client'

import { SettingsLayout, NotificationSettings } from '@/features/settings/components'

export default function NotificationsPage() {
  return (
    <SettingsLayout
      title="通知"
      description="通知設定とアラートの管理"
    >
      <NotificationSettings />
    </SettingsLayout>
  )
}

