'use client'

import { TagsPageClient } from '../tags-page-client'

/**
 * 未分類タグページ（group_id = null のタグを表示）
 */
export function UncategorizedPageClient() {
  return <TagsPageClient showUncategorizedOnly />
}
