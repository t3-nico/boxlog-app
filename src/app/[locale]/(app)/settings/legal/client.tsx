'use client'

import { SettingsLayout } from '@/features/settings/components'
import { AboutLegalSettings } from '@/features/settings/components/about-legal-settings'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export function LegalPageClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <AboutLegalSettings />
    </SettingsLayout>
  )
}
