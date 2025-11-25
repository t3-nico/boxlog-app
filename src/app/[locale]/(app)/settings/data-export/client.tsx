'use client'

import { SettingsLayout } from '@/features/settings/components'
import { DataExportSettings } from '@/features/settings/components/data-export-settings'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export function DataExportPageClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <DataExportSettings />
    </SettingsLayout>
  )
}
