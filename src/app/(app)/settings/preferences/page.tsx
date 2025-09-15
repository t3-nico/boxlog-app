'use client'

import { SettingsLayout, PreferencesSettings } from '@/features/settings/components'

const PreferencesPage = () => {
  return (
    <SettingsLayout
      title="環境設定"
      description="アプリケーションの表示や動作設定"
    >
      <PreferencesSettings />
    </SettingsLayout>
  )
}

export default PreferencesPage

