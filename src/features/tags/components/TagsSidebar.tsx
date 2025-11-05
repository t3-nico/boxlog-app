'use client'

import { FolderOpen, Inbox, Plus, Star, Tags } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import type { TagWithChildren } from '@/types/tags'

interface TagsSidebarProps {
  groups: TagWithChildren[]
  activeGroupId: string | null
  onGroupSelect: (groupId: string) => void
  onCreateGroup: () => void
  isLoading?: boolean
}

type SpecialView = 'all' | 'favorites' | 'uncategorized'

/**
 * タグページ用サイドバー
 *
 * 特別なビュー + グループ一覧と選択機能を提供
 */
export function TagsSidebar({
  groups,
  activeGroupId,
  onGroupSelect,
  onCreateGroup,
  isLoading = false,
}: TagsSidebarProps) {
  if (isLoading) {
    return (
      <aside className="bg-background text-foreground flex h-full w-full flex-col">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </aside>
    )
  }

  const handleSpecialViewClick = (view: SpecialView) => {
    // TODO: 特別なビューの処理を実装
    console.log('Special view clicked:', view)
  }

  return (
    <aside className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header - 見出し (40px) */}
      <div className="border-border flex h-10 shrink-0 items-center border-b px-4">
        <h2 className="text-foreground text-sm font-semibold">タグ</h2>
      </div>

      {/* コンテンツ */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {/* 特別なビュー */}
        <div className="mb-2 space-y-1">
          <button
            type="button"
            onClick={() => handleSpecialViewClick('all')}
            className="hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 shrink-0" />
              <span>すべてのタグ</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleSpecialViewClick('favorites')}
            className="hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 shrink-0" />
              <span>よく使う</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleSpecialViewClick('uncategorized')}
            className="hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 shrink-0" />
              <span>未分類</span>
            </div>
          </button>
        </div>

        <Separator className="my-2" />

        {/* グループヘッダー */}
        <div className="mb-2 flex items-center justify-between px-3 py-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="text-muted-foreground h-4 w-4 shrink-0" />
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">グループ</h3>
          </div>
          <button
            type="button"
            onClick={onCreateGroup}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded p-1 transition-colors"
            title="グループを追加"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* グループリスト */}
        {groups.length === 0 ? (
          <p className="text-muted-foreground px-3 py-2 text-xs">グループがありません</p>
        ) : (
          <ul className="space-y-1">
            {groups.map((group) => (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => onGroupSelect(group.id)}
                  className={`hover:bg-accent hover:text-accent-foreground w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    activeGroupId === group.id
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-sidebar-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: group.color || '#3B82F6' }}
                    />
                    <span className="min-w-0 flex-1 truncate">{group.name}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">{group.children?.length || 0}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* グループ追加ボタン */}
      <div className="border-border shrink-0 border-t p-2">
        <Button onClick={onCreateGroup} variant="outline" className="w-full justify-start gap-2" size="sm">
          <Plus className="h-4 w-4" />
          グループ追加
        </Button>
      </div>
    </aside>
  )
}
