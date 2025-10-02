'use client'

import { SettingsLayout, PreferencesSettings } from '@/features/settings/components'
import type { Locale } from '@/types/i18n'

interface Props {
  translations: {
    title: string
    description: string
  }
  locale: Locale
  dictionary: Record<string, unknown>
}

export default function PreferencesSettingsClient({ translations, locale, dictionary }: Props) {
  return (
    <SettingsLayout title={translations.title} description={translations.description}>
      <PreferencesSettings locale={locale} dictionary={dictionary} />
    </SettingsLayout>
  )
}
