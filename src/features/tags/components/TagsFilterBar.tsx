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
    <div className="flex h-12 shrink-0 items-center justify-between px-4 py-2">
      {/* 左側: 表示モード切り替え */}
      <div className="flex h-8 items-center">
        <PillSwitcher<TagDisplayMode>
          options={[
            { value: 'flat', label: t('tags.page.displayMode.flat'), icon: <List className="size-4" /> },
            { value: 'grouped', label: t('tags.page.displayMode.grouped'), icon: <FolderTree className="size-4" /> },
          ]}
          value={displayMode}
          onValueChange={setDisplayMode}
        />
      </div>

      {/* 右側: 検索・設定・作成 */}
      <div className="flex h-8 items-center gap-1">
        {/* Search - Google Drive style: icon button that expands to input */}
        {isSearchOpen ? (
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
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
                'h-8 w-48 border-none bg-transparent pr-8 pl-8 shadow-none',
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
          <Button variant="ghost" size="icon-sm" onClick={() => setIsSearchOpen(true)}>
            <Search className="size-4" />
          </Button>
        )}

        {/* Column settings dropdown - icon only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
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

        {onCreateClick && (
          <Button onClick={onCreateClick} className="ml-1">
            <Plus className="size-4" />
            {t('tags.page.createTag')}
          </Button>
        )}
      </div>
    </div>
  )
}
