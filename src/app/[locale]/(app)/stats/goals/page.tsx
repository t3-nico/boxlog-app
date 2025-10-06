'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const GoalsPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.goals')}</Heading>
}

export default GoalsPage
