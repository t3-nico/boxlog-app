'use client'

import { MobileSettingsRadioGroup, MobileSettingsSection } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ArrowUpDown } from 'lucide-react'

import { useInboxSortStore, type SortDirection, type SortField } from '../../stores/useInboxSortStore'

interface MobileSortSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * ソートフィールド選択肢
 */
const SORT_FIELD_OPTIONS: Array<{ value: SortField | 'none'; label: string }> = [
  { value: 'none', label: 'なし' },
  { value: 'title', label: 'タイトル' },
  { value: 'due_date', label: '期限' },
  { value: 'created_at', label: '作成日' },
  { value: 'updated_at', label: '更新日' },
  { value: 'status', label: 'ステータス' },
]

/**
 * ソート順選択肢
 */
const SORT_DIRECTION_OPTIONS: Array<{ value: SortDirection; label: string }> = [
  { value: 'asc', label: '昇順 (A → Z)' },
  { value: 'desc', label: '降順 (Z → A)' },
]

/**
 * モバイル用ソートシート
 *
 * Notion風のアイコンナビゲーションから開くソート専用シート
 */
export function MobileSortSheet({ open, onOpenChange }: MobileSortSheetProps) {
  const { sortField, sortDirection, setSort, clearSort } = useInboxSortStore()

  const handleFieldChange = (value: SortField | 'none') => {
    if (value === 'none') {
      clearSort()
    } else {
      setSort(value, sortDirection || 'asc')
    }
  }

  const handleDirectionChange = (value: SortDirection) => {
    if (sortField) {
      setSort(sortField, value)
    }
  }

  const handleReset = () => {
    clearSort()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="flex flex-row items-center justify-between pb-4">
          <SheetTitle>ソート</SheetTitle>
          {sortField && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-auto p-0 text-xs">
              リセット
            </Button>
          )}
        </SheetHeader>

        <div className="space-y-6 pb-4">
          {/* ソートフィールド */}
          <MobileSettingsSection icon={<ArrowUpDown />} title="並び替えの基準">
            <MobileSettingsRadioGroup
              options={SORT_FIELD_OPTIONS}
              value={sortField || 'none'}
              onValueChange={handleFieldChange}
              idPrefix="mobile-sort-field"
            />
          </MobileSettingsSection>

          {/* ソート順（フィールドが選択されている場合のみ） */}
          {sortField && (
            <MobileSettingsSection icon={<ArrowUpDown />} title="並び順" showSeparator={false}>
              <MobileSettingsRadioGroup
                options={SORT_DIRECTION_OPTIONS}
                value={sortDirection || 'asc'}
                onValueChange={handleDirectionChange}
                idPrefix="mobile-sort-direction"
              />
            </MobileSettingsSection>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
