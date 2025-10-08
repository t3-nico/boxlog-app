'use client'

import { TagsList } from '@/features/tags/components/tags-list'

interface BoardSidebarSectionsProps {
  collapsed: boolean
  // タグフィルター関連
  onSelectTag: (tagId: string) => void
  selectedTagIds: string[]
}

export const BoardSidebarSections = ({ collapsed, onSelectTag, selectedTagIds }: BoardSidebarSectionsProps) => {
  return (
    <>
      {/* カンバン設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-muted-foreground p-2 text-sm">Board Settings (Coming Soon)</div>
      </div>

      {/* ボードレイアウト設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-muted-foreground p-2 text-sm">Layout Options (Coming Soon)</div>
      </div>

      {/* 通常タグフィルター */}
      <div className="flex-shrink-0">
        <TagsList collapsed={collapsed} onSelectTag={onSelectTag} selectedTagIds={selectedTagIds} />
      </div>
    </>
  )
}
