'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const ActTryPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.act.try')}</Heading>
}

export default ActTryPage
