'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const AntiValuesPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.antivalues')}</Heading>
}

export default AntiValuesPage
