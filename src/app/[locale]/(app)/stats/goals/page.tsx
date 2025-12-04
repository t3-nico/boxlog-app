'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const GoalsPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.goals')}</Heading>
}

export default GoalsPage
