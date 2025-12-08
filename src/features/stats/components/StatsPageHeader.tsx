'use client'

import { PageHeader } from '@/components/common/PageHeader'

interface StatsPageHeaderProps {
  title: string
  subtitle?: string
}

/**
 * 統計ページメインコンテンツヘッダー
 *
 * @deprecated PageHeader を直接使用することを推奨
 */
export function StatsPageHeader({ title, subtitle }: StatsPageHeaderProps) {
  return <PageHeader title={title} subtitle={subtitle} />
}
