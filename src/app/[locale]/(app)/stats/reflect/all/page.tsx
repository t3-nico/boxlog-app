'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const ReflectAllPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.reflect.all')}</Heading>
}

export default ReflectAllPage
