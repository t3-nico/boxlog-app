'use client'

import { useI18n } from '@/features/i18n/lib/hooks'
import { SettingsLayout } from '@/features/settings/components'
import AboutLegalSettings from '@/features/settings/components/about-legal-settings'

const LegalPage = () => {
  const { t } = useI18n()

  return (
    <SettingsLayout title={t('settings.legal.title')} description={t('settings.legal.description')}>
      <AboutLegalSettings />
    </SettingsLayout>
  )
}

export default LegalPage
