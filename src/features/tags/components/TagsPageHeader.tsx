'use client'

import type { ReactNode } from 'react'

import { PageHeader } from '@/components/common/PageHeader'

interface TagsPageHeaderProps {
  title: string
  count?: number
  actions?: ReactNode
}

/**
 * タグページメインコンテンツヘッダー
 *
 * @deprecated PageHeader を直接使用することを推奨
 */
export function TagsPageHeader({ title, count, actions }: TagsPageHeaderProps) {
  return <PageHeader title={title} count={count} actions={actions} />
}
