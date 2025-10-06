// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import { getDictionary, createTranslation } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'

import IntegrationPageClient from './client'

interface PageProps {
  params: { locale?: Locale }
}

export default async function IntegrationPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  const translations = {
    title: t('settings.integration.title'),
    description: t('settings.integration.description'),
  }

  return <IntegrationPageClient translations={translations} />
}

