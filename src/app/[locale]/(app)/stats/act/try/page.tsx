'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const ActTryPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.act.try')}</Heading>
}

export default ActTryPage
