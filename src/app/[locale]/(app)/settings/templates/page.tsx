import { getDictionary, createTranslation } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

import TemplatesPageClient from './client'

interface PageProps {
  params: { locale?: Locale }
}

export default async function TemplatesPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  const translations = {
    title: t('settings.templates.title'),
    description: t('settings.templates.description'),
  }

  return <TemplatesPageClient translations={translations} />
}
