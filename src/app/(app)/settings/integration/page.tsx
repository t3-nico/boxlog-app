'use client'

import { SettingsLayout } from '@/features/settings/components'
import IntegrationSettings from '@/features/settings/components/integration-settings'

const IntegrationPage = () => {
  return (
    <SettingsLayout
      title="連携設定"
      description="外部サービスとの連携を管理します"
    >
      <IntegrationSettings />
    </SettingsLayout>
  )
}

export default IntegrationPage

