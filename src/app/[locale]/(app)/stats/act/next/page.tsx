'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ActNextPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.act.next')}</Heading>
}

export default ActNextPage
