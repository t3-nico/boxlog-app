'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const ConnpassPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.connpass')}</Heading>
}

export default ConnpassPage
