'use client'

import React from 'react'

import { TagsList } from '@/features/tags/components/tags-list'

interface TableSidebarSectionsProps {
  collapsed: boolean
  // タグフィルター関連
  onSelectTag: (tagId: string) => void
  selectedTagIds: string[]
}

export const TableSidebarSections = ({
  collapsed,
  onSelectTag,
  selectedTagIds
}: TableSidebarSectionsProps) => {
  return (
    <>
      {/* カラム設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-sm text-muted-foreground p-2">
          Column Settings (Coming Soon)
        </div>
      </div>

      {/* ソート・フィルター設定（将来拡張予定） */}
      <div className="flex-shrink-0">
        <div className="text-sm text-muted-foreground p-2">
          Sort & Filter (Coming Soon)
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