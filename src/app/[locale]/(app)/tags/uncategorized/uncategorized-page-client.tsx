'use client'

import { FolderOpen } from 'lucide-react'

import { TagsPageClient } from '../tags-page-client'

/**
 * 未分類タグページ（group_id = null のタグを表示）
 */
export function UncategorizedPageClient() {
  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="border-border flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
        <FolderOpen className="text-muted-foreground h-5 w-5 shrink-0" />
        <div>
          <h1 className="text-lg font-semibold">未分類</h1>
          <p className="text-muted-foreground text-xs">グループに属していないタグ</p>
        </div>
      </div>

      {/* TagsPageClient に uncategorized フラグを渡して未分類タグのみ表示 */}
      <TagsPageClient showUncategorizedOnly />
    </div>
  )
}
