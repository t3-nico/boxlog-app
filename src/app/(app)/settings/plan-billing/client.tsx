'use client'

import { SettingsLayout } from '@/features/settings/components'
import PlanBillingSettings from '@/features/settings/components/plan-billing-settings'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export default function PlanBillingPageClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <PlanBillingSettings />
    </SettingsLayout>
  )
}
