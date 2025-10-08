'use client'

import { CalendarSettings, SettingsLayout } from '@/features/settings/components'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export default function CalendarSettingsClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <CalendarSettings />
    </SettingsLayout>
  )
}
