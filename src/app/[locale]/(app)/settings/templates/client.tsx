'use client'

import { SettingsLayout } from '@/features/settings/components'
import { TemplatesSettings } from '@/features/settings/components/templates-settings'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export function TemplatesPageClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <TemplatesSettings />
    </SettingsLayout>
  )
}
