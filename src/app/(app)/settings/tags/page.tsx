import type { Metadata } from 'next'

import { TagsPageClient } from './tags-page-client'

export const metadata: Metadata = {
  title: 'タグ管理 - BoxLog',
  description: '階層構造でタグを整理・管理できます',
}

const TagsSettingsPage = () => {
  return <TagsPageClient />
}

export default TagsSettingsPage
