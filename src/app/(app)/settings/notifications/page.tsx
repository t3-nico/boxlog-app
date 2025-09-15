'use client'

import { SettingsLayout, NotificationSettings } from '@/features/settings/components'

const NotificationsPage = () => {
  return (
    <SettingsLayout
      title="通知"
      description="通知設定とアラートの管理"
    >
      <NotificationSettings />
    </SettingsLayout>
  )
}

export default NotificationsPage

