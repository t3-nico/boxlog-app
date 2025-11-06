import { Metadata } from 'next'

import { TagsPageClient } from '../tags-page-client'

export const metadata: Metadata = {
  title: 'タグ管理',
  description: 'タグの作成、編集、削除を行います',
}

interface TagGroupPageProps {
  params: {
    locale: string
    groupId: string
  }
}

export default function TagGroupPage({ params }: TagGroupPageProps) {
  // g-1 形式から数値を抽出
  const groupNumber = params.groupId.startsWith('g-') ? params.groupId.slice(2) : params.groupId

  return <TagsPageClient initialGroupNumber={groupNumber} />
}
