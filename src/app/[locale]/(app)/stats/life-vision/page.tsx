'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const LifeVisionPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.lifeVision')}</Heading>
}

export default LifeVisionPage
