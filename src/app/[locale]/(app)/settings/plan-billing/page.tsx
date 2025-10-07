'use client'

import { useI18n } from '@/features/i18n/lib/hooks'
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

