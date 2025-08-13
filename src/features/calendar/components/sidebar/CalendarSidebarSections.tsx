'use client'

import React from 'react'
import { Calendar } from '@/components/shadcn-ui/calendar'
import { CalendarDisplayMode } from '../calendar-display-mode'
import { CalendarTagFilter } from '../calendar-tag-filter'
interface CalendarSidebarSectionsProps {
  collapsed: boolean
  // 日付選択関連
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
  // タグフィルター関連
  tags: any[] // カレンダー用のタグ型を後で修正
  selectedTags: string[]
  tagFilterMode: 'AND' | 'OR' // CalendarTagFilterで使用されている型に合わせる
  onTagSelect: (tagId: string) => void
  onToggleExpand: (tagId: string) => void
  onFilterModeChange: (mode: 'AND' | 'OR') => void
  onManageTags: () => void
  onCreateTag: () => void
}

export function CalendarSidebarSections({
  collapsed,
  selectedDate,
  onDateSelect,
  tags,
  selectedTags,
  tagFilterMode,
  onTagSelect,
  onToggleExpand,
  onFilterModeChange,
  onManageTags,
  onCreateTag
}: CalendarSidebarSectionsProps) {
  return (
    <>
      {/* 日付選択カレンダー */}
      <div className="flex-shrink-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="w-full p-0"
          weekStartsOn={1}
        />
      </div>
      
      {/* カレンダー表示モード選択 */}
      <div className="flex-shrink-0">
        <CalendarDisplayMode />
      </div>

      {/* カレンダー用タグフィルター */}
      <div className="flex-shrink-0">
        <CalendarTagFilter
          collapsed={collapsed}
          tags={tags}
          selectedTags={selectedTags}
          tagFilterMode={tagFilterMode}
          onTagSelect={onTagSelect}
          onToggleExpand={onToggleExpand}
          onFilterModeChange={onFilterModeChange}
          onManageTags={onManageTags}
          onCreateTag={onCreateTag}
        />
      </div>
    </>
  )
}