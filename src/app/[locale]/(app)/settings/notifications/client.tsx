'use client'

import { NotificationSettings, SettingsLayout } from '@/features/settings/components'

interface Props {
  translations: {
    title: string
    description: string
  }
}

export default function NotificationsPageClient({ translations }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <NotificationSettings />
    </SettingsLayout>
  )
}
