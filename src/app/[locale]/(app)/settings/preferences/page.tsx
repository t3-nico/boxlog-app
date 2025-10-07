import { getDictionary, createTranslation } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

import PreferencesSettingsClient from './client'

interface PageProps {
  params: { locale?: Locale }
}

export default async function PreferencesPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  const translations = {
    title: t('settings.preferences.title'),
    description: t('settings.preferences.description'),
  }

  return <PreferencesSettingsClient translations={translations} />
}

