import type { Locale } from '@/i18n/routing'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { SecurityContent } from './security-content'

/**
 * メタデータ生成（SEO対策）
 */
interface MetadataProps {
  params: Promise<{ locale?: Locale }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale = 'ja' } = await params
  const t = await getTranslations({ locale })

  return {
    title: `${t('legal.security.header.title')} - BoxLog`,
    description: t('legal.security.header.description'),
  }
}

/**
 * セキュリティポリシーページ（Server Component）
 */
export default function SecurityPage() {
  return <SecurityContent />
}
