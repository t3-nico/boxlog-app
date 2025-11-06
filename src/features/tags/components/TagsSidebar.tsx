'use client'

import { Archive, Tags } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

interface TagsSidebarProps {
  onAllTagsClick: () => void
  isLoading?: boolean
}

/**
 * タグページ用サイドバー
 *
 * すべてのタグとアーカイブビューを提供
 */
export function TagsSidebar({ onAllTagsClick, isLoading = false }: TagsSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isArchivePage = pathname?.includes('/archive')

  if (isLoading) {
    return (
      <aside className="bg-background text-foreground flex h-full w-full flex-col">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </aside>
    )
  }

  const handleArchiveClick = () => {
    const locale = pathname?.split('/')[1] || 'ja'
    router.push(`/${locale}/tags/archive`)
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
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              isArchivePage ? 'hover:bg-accent hover:text-accent-foreground' : 'bg-accent text-accent-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 shrink-0" />
              <span>すべてのタグ</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleArchiveClick}
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              isArchivePage ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 shrink-0" />
              <span>アーカイブ</span>
            </div>
          </button>
        </div>
      </nav>
    </aside>
  )
}
