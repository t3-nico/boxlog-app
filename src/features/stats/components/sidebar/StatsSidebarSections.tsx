'use client'

import React from 'react'
import { TagsList } from '@/features/tags/components/tags-list'

interface StatsSidebarSectionsProps {
  collapsed: boolean
  // タグフィルター関連
  onSelectTag: (tagId: string) => void
  selectedTagIds: string[]
}

export function StatsSidebarSections({
  collapsed,
  onSelectTag,
  selectedTagIds
}: StatsSidebarSectionsProps) {
  return (
    <>
      {/* 期間設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-sm text-muted-foreground p-2">
          Date Range Settings (Coming Soon)
        </div>
      </div>

      {/* グラフ設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-sm text-muted-foreground p-2">
          Chart Settings (Coming Soon)
        </div>
      </div>

      {/* 通常タグフィルター */}
      <div className="flex-shrink-0">
        <TagsList
          collapsed={collapsed}
          onSelectTag={onSelectTag}
          selectedTagIds={selectedTagIds}
        />
      </div>
    </>
  )
}