'use client'

import { FolderTree, List, Plus } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { PillSwitcher } from '@/components/ui/pill-switcher'
import { TableNavigation, type TableNavigationConfig } from '@/features/table'
import { type TagDisplayMode, useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore'
import { TagsSettingsContent } from './TagsSettingsContent'

interface TagsFilterBarProps {
  onCreateClick?: (() => void) | undefined
  /** 検索クエリ */
  searchQuery: string
  /** 検索クエリ変更時のコールバック */
  onSearchChange: (query: string) => void
  t: (key: string) => string
}

/**
 * Tags page filter bar with icon navigation
 *
 * Notion風のアイコンナビゲーション（検索・設定）を提供
 * - TableNavigation を使用してPC・モバイル共通UI
 * - ソート機能なし（タグページはソート不要）
 *
 * @example
 * ```tsx
 * <TagsFilterBar
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   onCreateClick={handleCreate}
 *   t={t}
 * />
 * ```
 */
export function TagsFilterBar({ onCreateClick, searchQuery, onSearchChange, t }: TagsFilterBarProps) {
  const { displayMode, setDisplayMode } = useTagDisplayModeStore()

  // TableNavigation設定（タグはソート機能なし）
  const navigationConfig: TableNavigationConfig = useMemo(
    () => ({
      search: searchQuery,
      onSearchChange,
      sortField: null,
      sortDirection: null,
      onSortChange: () => {},
      onSortClear: () => {},
      sortFieldOptions: [],
      settingsContent: <TagsSettingsContent />,
      hasActiveSettings: searchQuery.length > 0,
      onSettingsReset: () => {
        onSearchChange('')
      },
    }),
    [searchQuery, onSearchChange]
  )

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 px-4 py-2">
      {/* 左端: 表示モード切替（モバイル・デスクトップ共通） */}
      <PillSwitcher<TagDisplayMode>
        options={[
          { value: 'flat', label: t('tags.page.displayMode.flat'), icon: <List className="size-4" /> },
          { value: 'grouped', label: t('tags.page.displayMode.grouped'), icon: <FolderTree className="size-4" /> },
        ]}
        value={displayMode}
        onValueChange={setDisplayMode}
      />

      {/* スペーサー */}
      <div className="flex-1" />

      {/* Notion風アイコンナビゲーション（検索・設定）- PC・モバイル共通 */}
      <TableNavigation config={navigationConfig} />

      {/* 作成ボタン: 固定位置（モバイル: アイコンのみ、PC: テキスト付き） */}
      {onCreateClick && (
        <>
          <Button onClick={onCreateClick} size="sm" className="shrink-0 md:hidden">
            <Plus className="size-4" />
          </Button>
          <Button onClick={onCreateClick} className="hidden shrink-0 md:inline-flex">
            <Plus className="size-4" />
            {t('tags.page.createTag')}
          </Button>
        </>
      )}
    </div>
  )
}
