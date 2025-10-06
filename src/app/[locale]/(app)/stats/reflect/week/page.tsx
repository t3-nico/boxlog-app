'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const ReflectWeekPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.reflect.week')}</Heading>
}

export default ReflectWeekPage
