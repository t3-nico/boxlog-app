'use client'

import { useI18n } from '@/lib/i18n/hooks'
import { SettingsLayout } from '@/features/settings/components'
import PlanBillingSettings from '@/features/settings/components/plan-billing-settings'

const PlanBillingPage = () => {
  const { t } = useI18n()

  return (
    <SettingsLayout
      title={t('settings.planBilling.title')}
      description={t('settings.planBilling.description')}
    >
      <PlanBillingSettings />
    </SettingsLayout>
  )
}

export default PlanBillingPage

