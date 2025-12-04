'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const LifeVisionPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.lifeVision')}</Heading>
}

export default LifeVisionPage
