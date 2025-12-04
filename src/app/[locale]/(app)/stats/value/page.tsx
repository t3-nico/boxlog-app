'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ValuePage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.value')}</Heading>
}

export default ValuePage
