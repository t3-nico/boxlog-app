'use client'

import { SettingsLayout, AccountSettings } from '@/features/settings/components'

export default function AccountSettingsPage() {
  return (
    <SettingsLayout
      title="アカウント"
      description="アカウント設定とプロフィール情報の管理"
    >
      <AccountSettings />
    </SettingsLayout>
  )
}

