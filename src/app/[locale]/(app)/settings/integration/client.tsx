'use client'

import { SettingsLayout } from '@/features/settings/components'
import IntegrationSettings from '@/features/settings/components/integration-settings'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export default function IntegrationPageClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <IntegrationSettings />
    </SettingsLayout>
  )
}
