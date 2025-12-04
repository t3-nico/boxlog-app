'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ReflectTodayPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.reflect.today')}</Heading>
}

export default ReflectTodayPage
