'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const AntiValuesPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.antivalues')}</Heading>
}

export default AntiValuesPage
