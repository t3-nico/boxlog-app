'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ConnpassPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.connpass')}</Heading>
}

export default ConnpassPage
