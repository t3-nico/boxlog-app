'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

/**
 * 統計ページヘッダー
 *
 * レイアウトの一番上に配置し、タイトルとモバイルメニューを表示
 */
export function StatsPageHeader() {
  const t = useTranslations()

  return <PageHeader title={t('stats.sidebar.overview')} />
}
