import type { Metadata } from 'next'

import { TagDetailPageClient } from './tag-detail-page-client'

export const metadata: Metadata = {
  title: 'タグ詳細',
  description: 'タグが付いたアイテム一覧',
}

interface TagDetailPageProps {
  params: Promise<{
    locale: string
    tagNumber: string
  }>
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
  const { tagNumber } = await params
  return <TagDetailPageClient tagNumber={tagNumber} />
}
