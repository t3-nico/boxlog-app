'use client'

import { Heading } from '@/components/app'
import { useI18n } from '@/lib/i18n/hooks'

const IdentityPage = () => {
  const { t } = useI18n()
  return <Heading>{t('stats.identity')}</Heading>
}

export default IdentityPage
