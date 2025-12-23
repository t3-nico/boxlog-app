'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { TagColumnId } from '@/features/tags/stores/useTagColumnStore'
import { useTagDisplayModeStore } from '@/features/tags/stores/useTagDisplayModeStore'
import { Check, FolderTree, List, Search, Settings2, SlidersHorizontal, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface ColumnSetting {
  id: TagColumnId
  label: string
}

interface VisibleColumn {
  id: string
  width: number
}

interface MobileTagsSettingsSheetProps {
  columnSettings: ColumnSetting[]
  visibleColumns: VisibleColumn[]
  onColumnVisibilityChange: (columnId: TagColumnId, visible: boolean) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  t: (key: string) => string
}

/**
 * モバイル用タグ設定シート
 *
 * Notion風の1つのアイコンから全設定にアクセスできるボトムシート
 * - 検索
 * - 表示モード切替（フラット/グループ）
 * - 列設定
 *
 * @example
 * ```tsx
 * <MobileTagsSettingsSheet
 *   columnSettings={columnSettings}
 *   visibleColumns={visibleColumns}
 *   onColumnVisibilityChange={handleColumnVisibilityChange}
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   t={t}
 * />
 * ```
 */
export function MobileTagsSettingsSheet({
  columnSettings,
  visibleColumns,
  onColumnVisibilityChange,
  searchQuery,
  onSearchChange,
  t,
}: MobileTagsSettingsSheetProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 表示モード
  const { displayMode, setDisplayMode } = useTagDisplayModeStore()

  // アクティブな設定があるかどうか
  const hasActiveSettings = searchQuery.length > 0

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative shrink-0">
          <SlidersHorizontal className="size-4" />
          {hasActiveSettings && <span className="bg-primary absolute -top-0.5 -right-0.5 size-2 rounded-full" />}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>{t('tags.page.settings')}</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon-sm">
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">
          {/* 検索 */}
          <section className="py-4">
            <div className="mb-3 flex items-center gap-2">
              <Search className="text-muted-foreground size-4" />
              <h3 className="text-sm font-medium">{t('tags.page.search')}</h3>
            </div>
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder={t('tags.page.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </section>

          <Separator />

          {/* 表示モード */}
          <section className="py-4">
            <div className="mb-3 flex items-center gap-2">
              <List className="text-muted-foreground size-4" />
              <h3 className="text-sm font-medium">{t('tags.page.displayMode.title')}</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant={displayMode === 'flat' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('flat')}
                className="flex-1"
              >
                <List className="mr-2 size-4" />
                {t('tags.page.displayMode.flat')}
              </Button>
              <Button
                variant={displayMode === 'grouped' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('grouped')}
                className="flex-1"
              >
                <FolderTree className="mr-2 size-4" />
                {t('tags.page.displayMode.grouped')}
              </Button>
            </div>
          </section>

          <Separator />

          {/* 列設定 */}
          <section className="py-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings2 className="text-muted-foreground size-4" />
              <h3 className="text-sm font-medium">{t('tags.page.columnSettings')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {columnSettings.map((col) => {
                const isVisible = visibleColumns.some((c) => c.id === col.id)
                return (
                  <Label
                    key={col.id}
                    htmlFor={`mobile-tag-column-${col.id}`}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      isVisible ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      id={`mobile-tag-column-${col.id}`}
                      checked={isVisible}
                      onCheckedChange={(checked) => onColumnVisibilityChange(col.id, !!checked)}
                      className="sr-only"
                    />
                    {col.label}
                    {isVisible && <Check className="size-3" />}
                  </Label>
                )
              })}
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
