'use client'

import { AccountSettings, SettingsLayout } from '@/features/settings/components'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export default function AccountSettingsClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <AccountSettings />
    </SettingsLayout>
  )
}
