'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const ConnpassPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.connpass')}</Heading>
}

export default ConnpassPage
