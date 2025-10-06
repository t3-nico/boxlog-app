import { getDictionary, createTranslation } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'

import NotificationsPageClient from './client'

interface PageProps {
  params: { locale?: Locale }
}

export default async function NotificationsPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  const translations = {
    title: t('settings.notifications.title'),
    description: t('settings.notifications.description'),
  }

  return <NotificationsPageClient translations={translations} />
}

