'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const ReflectMonthPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.reflect.month')}</Heading>
}

export default ReflectMonthPage
