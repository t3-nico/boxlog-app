'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const PrinciplesPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.principles')}</Heading>
}

export default PrinciplesPage
