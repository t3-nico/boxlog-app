'use client'

import { Tags } from 'lucide-react'

interface TagsSidebarProps {
  onAllTagsClick: () => void
  isLoading?: boolean
}

/**
 * タグページ用サイドバー（シンプル版）
 *
 * すべてのタグビューのみを提供
 */
export function TagsSidebar({ onAllTagsClick, isLoading = false }: TagsSidebarProps) {
  if (isLoading) {
    return (
      <aside className="bg-background text-foreground flex h-full w-full flex-col">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header - 見出し (40px) */}
      <div className="border-border flex h-10 shrink-0 items-center border-b px-4">
        <h2 className="text-foreground text-sm font-semibold">タグ</h2>
      </div>

      {/* コンテンツ */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onAllTagsClick}
            className="bg-accent text-accent-foreground w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 shrink-0" />
              <span>すべてのタグ</span>
            </div>
          </button>
        </div>
      </nav>
    </aside>
  )
}
