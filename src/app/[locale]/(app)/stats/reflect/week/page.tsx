'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ReflectWeekPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.reflect.week')}</Heading>
}

export default ReflectWeekPage
