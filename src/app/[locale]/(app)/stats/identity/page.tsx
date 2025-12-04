'use client'

import { Heading } from '@/components/app'
import { useTranslations } from 'next-intl'

const IdentityPage = () => {
  const t = useTranslations()
  return <Heading>{t('stats.identity')}</Heading>
}

export default IdentityPage
