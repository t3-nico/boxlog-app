'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ActTryPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.act.try')}</Heading>
}

export default ActTryPage
