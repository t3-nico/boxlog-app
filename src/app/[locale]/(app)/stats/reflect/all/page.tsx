'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const ReflectAllPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.reflect.all')}</Heading>
}

export default ReflectAllPage
