'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const PurposePage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.purpose')}</Heading>
}

export default PurposePage
