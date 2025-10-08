import { createTranslation, getDictionary } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

import AccountSettingsClient from './client'

interface PageProps {
  params: { locale?: Locale }
}

export default async function AccountSettingsPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  const translations = {
    title: t('settings.account.title'),
    description: t('settings.account.description'),
  }

  return <AccountSettingsClient translations={translations} />
}
