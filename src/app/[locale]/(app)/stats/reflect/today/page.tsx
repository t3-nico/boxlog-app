'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const ReflectTodayPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.reflect.today')}</Heading>
}

export default ReflectTodayPage
