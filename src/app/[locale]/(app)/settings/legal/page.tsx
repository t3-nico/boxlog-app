'use client'

import { SettingsLayout } from '@/features/settings/components'
import AboutLegalSettings from '@/features/settings/components/about-legal-settings'

const LegalPage = () => {
  return (
    <SettingsLayout
      title="法的情報"
      description="プライバシーポリシー、利用規約、アプリ情報を確認できます"
    >
      <AboutLegalSettings />
    </SettingsLayout>
  )
}

export default LegalPage

