'use client'

import { PreferencesSettings, SettingsLayout } from '@/features/settings/components'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export function PreferencesSettingsClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <PreferencesSettings />
    </SettingsLayout>
  )
}
