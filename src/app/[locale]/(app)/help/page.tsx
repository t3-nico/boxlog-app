import { createTranslation, getDictionary } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

import HelpPageClient from './client'

interface PageProps {
  params: { locale?: Locale }
}

export default async function HelpPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  const translations = {
    errorMessage: t('help.status.error'),
  }

  return <HelpPageClient translations={translations} />
}
