'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const ActNextPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.act.next')}</Heading>
}

export default ActNextPage
