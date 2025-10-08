'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const ReflectWeekPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.reflect.week')}</Heading>
}

export default ReflectWeekPage
