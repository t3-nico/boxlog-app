'use client'

import { SettingsLayout, PreferencesSettings } from '@/features/settings/components'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export default function PreferencesSettingsClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <PreferencesSettings />
    </SettingsLayout>
  )
}
