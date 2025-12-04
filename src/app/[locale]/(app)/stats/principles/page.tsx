'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const PrinciplesPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.principles')}</Heading>
}

export default PrinciplesPage
