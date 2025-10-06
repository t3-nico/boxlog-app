'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const LifeVisionPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.lifeVision')}</Heading>
}

export default LifeVisionPage
