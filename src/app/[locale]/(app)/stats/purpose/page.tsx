'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const PurposePage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.purpose')}</Heading>
}

export default PurposePage
