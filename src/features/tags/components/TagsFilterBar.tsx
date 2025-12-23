'use client'

import { FolderTree, List, Plus, Search, Settings2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { PillSwitcher } from '@/components/ui/pill-switcher'
import type { TagColumnId } from '@/features/tags/stores/useTagColumnStore'
import { type TagDisplayMode, useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore'
import { cn } from '@/lib/utils'
import { MobileTagsSettingsSheet } from './MobileTagsSettingsSheet'

interface ColumnSetting {
  id: TagColumnId
  label: string
}

interface VisibleColumn {
  id: string
  width: number
}

interface TagsFilterBarProps {
  columnSettings: ColumnSetting[]
  visibleColumns: VisibleColumn[]
  onColumnVisibilityChange: (columnId: TagColumnId, visible: boolean) => void
  onCreateClick?: () => void
  /** 検索クエリ */
  searchQuery: string
  /** 検索クエリ変更時のコールバック */
  onSearchChange: (query: string) => void
  t: (key: string) => string
}

/**
 * Tags page filter bar with column settings and create button
 */
export function TagsFilterBar({
  columnSettings,
  visibleColumns,
  onColumnVisibilityChange,
  onCreateClick,
  searchQuery,
  onSearchChange,
  t,
}: TagsFilterBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 検索クエリがある場合は常に開いた状態にする
  useEffect(() => {
    if (searchQuery) {
      setIsSearchOpen(true)
    }
  }, [searchQuery])

  // 検索を開いたらフォーカス
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearchClose = () => {
    if (!searchQuery) {
      setIsSearchOpen(false)
    }
  }

  const { displayMode, setDisplayMode } = useTagDisplayModeStore()

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

      {/* デスクトップ: 検索・列設定のツールバー */}
      <div className="hidden h-8 flex-1 items-center gap-2 overflow-x-auto md:flex">
        {/* 検索 - Google Drive style: icon button that expands to input */}
        {isSearchOpen ? (
          <div className="relative shrink-0">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={t('tags.page.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={handleSearchClose}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onSearchChange('')
                  setIsSearchOpen(false)
                }
              }}
              className={cn(
                'h-8 w-32 border-none bg-transparent pr-8 pl-8 shadow-none sm:w-48',
                'focus-visible:ring-1 focus-visible:ring-offset-0'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('')
                  inputRef.current?.focus()
                }}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <Button variant="ghost" size="icon-sm" onClick={() => setIsSearchOpen(true)} className="shrink-0">
            <Search className="size-4" />
          </Button>
        )}

        {/* 列設定 dropdown - icon only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <Settings2 className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('tags.page.columnSettings')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columnSettings.map((col) => {
              const column = visibleColumns.find((c) => c.id === col.id)
              const isVisible = !!column
              return (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={isVisible}
                  onCheckedChange={(checked) => onColumnVisibilityChange(col.id, checked)}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* モバイル: スペーサー */}
      <div className="flex-1 md:hidden" />

      {/* モバイル: 設定シートボタン（作成ボタンの左隣） */}
      <div className="md:hidden">
        <MobileTagsSettingsSheet
          columnSettings={columnSettings}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={onColumnVisibilityChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          t={t}
        />
      </div>

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
