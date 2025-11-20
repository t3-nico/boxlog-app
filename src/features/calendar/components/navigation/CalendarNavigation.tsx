'use client'

import { ArrowDown, ArrowUp, Plus, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type CalendarSortType = 'updated-desc' | 'updated-asc'

interface CalendarNavigationProps {
  sort: CalendarSortType
  onSortChange: (sort: CalendarSortType) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onCreateClick: () => void
}

/**
 * CalendarNavigation - カレンダーメインエリアのナビゲーション
 *
 * **構成**:
 * - ArrowUpDown icon: 更新日ソート（Latest / Oldest）
 * - Tag icon: タグフィルター（複数選択可）
 * - Plus icon: 新規作成ボタン
 */
export function CalendarNavigation({
  sort,
  onSortChange,
  selectedTags,
  onTagsChange,
  onCreateClick,
}: CalendarNavigationProps) {
  const handleSortToggle = () => {
    const newSort = sort === 'updated-desc' ? 'updated-asc' : 'updated-desc'
    console.log('CalendarNavigation - Sort toggled:', newSort)
    onSortChange(newSort)
  }

  const handleTagClick = () => {
    // TODO: タグソート実装
    console.log('Tag clicked')
  }

  return (
    <div className="flex w-full items-center justify-between">
      {/* 左側: ソート・フィルター */}
      <div className="flex items-center gap-1">
        {/* 更新日ソート（クリックでトグル） */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSortToggle}>
          <div className="flex items-center justify-center">
            <ArrowUp className="-mr-1 h-3 w-3" strokeWidth={sort === 'updated-asc' ? 2.5 : 1.5} />
            <ArrowDown className="h-3 w-3" strokeWidth={sort === 'updated-desc' ? 2.5 : 1.5} />
          </div>
          <span className="sr-only">Sort by updated ({sort === 'updated-desc' ? 'Latest' : 'Oldest'})</span>
        </Button>

        {/* タグソート */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTagClick}>
          <Tag className="h-4 w-4" />
          <span className="sr-only">Sort by tags</span>
        </Button>
      </div>

      {/* 右側: 新規作成ボタン */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        <span className="sr-only">Create new task</span>
      </Button>
    </div>
  )
}
