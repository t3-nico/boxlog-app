'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const ValuePage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.value')}</Heading>
}

export default ValuePage
