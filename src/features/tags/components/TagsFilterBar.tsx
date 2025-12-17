'use client'

import { ChevronDown, Filter, Plus, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TagColumnId } from '@/features/tags/stores/useTagColumnStore'

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
  onCreateClick: () => void
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
  t,
}: TagsFilterBarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-4 py-2">
      <div className="flex h-8 items-center gap-2">
        {/* Filter type dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>{t('tags.page.filter.type')}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>{t('tags.page.filter.all')}</DropdownMenuItem>
            <DropdownMenuItem>{t('tags.page.filter.unused')}</DropdownMenuItem>
            <DropdownMenuItem>{t('tags.page.filter.frequentlyUsed')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Column settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Settings2 className="h-3.5 w-3.5" />
              <span>{t('tags.page.columns')}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
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
      <div className="flex h-8 items-center">
        <Button onClick={onCreateClick} size="sm" className="h-8">
          <Plus className="mr-2 size-4" />
          {t('tags.page.createTag')}
        </Button>
      </div>
    </div>
  )
}
