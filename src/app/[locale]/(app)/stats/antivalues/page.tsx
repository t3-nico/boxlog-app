'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const AntiValuesPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.antivalues')}</Heading>
}

export default AntiValuesPage
