'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/features/i18n/lib/hooks'

const IdentityPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.identity')}</Heading>
}

export default IdentityPage
