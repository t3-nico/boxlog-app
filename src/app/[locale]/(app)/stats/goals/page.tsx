'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const GoalsPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.goals')}</Heading>
}

export default GoalsPage
