'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ReflectMonthPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.reflect.month')}</Heading>
}

export default ReflectMonthPage
