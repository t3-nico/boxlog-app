'use client'

import { TagsList } from '@/features/tags/components/tags-list'

interface StatsSidebarSectionsProps {
  collapsed: boolean
  // タグフィルター関連
  onSelectTag: (tagId: string) => void
  selectedTagIds: string[]
}

export const StatsSidebarSections = ({ collapsed, onSelectTag, selectedTagIds }: StatsSidebarSectionsProps) => {
  return (
    <>
      {/* 期間設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-muted-foreground p-2 text-sm">Date Range Settings (Coming Soon)</div>
      </div>

      {/* グラフ設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-muted-foreground p-2 text-sm">Chart Settings (Coming Soon)</div>
      </div>

      {/* 通常タグフィルター */}
      <div className="flex-shrink-0">
        <TagsList collapsed={collapsed} onSelectTag={onSelectTag} selectedTagIds={selectedTagIds} />
      </div>
    </>
  )
}
