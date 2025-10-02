import { getDictionary, createTranslation } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'

import CalendarSettingsClient from './client'

interface PageProps {
  params: { locale?: Locale }
}

export default async function CalendarPage({ params }: PageProps) {
  const locale = params.locale || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  const translations = {
    title: t('settings.calendar.title'),
    description: t('settings.calendar.description'),
  }

  return <CalendarSettingsClient translations={translations} />
}