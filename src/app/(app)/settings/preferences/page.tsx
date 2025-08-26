'use client'

import { SettingsLayout, PreferencesSettings } from '@/features/settings/components'

export default function PreferencesPage() {
  return (
    <SettingsLayout
      title="環境設定"
      description="アプリケーションの表示や動作設定"
    >
      <PreferencesSettings />
    </SettingsLayout>
  )
}

