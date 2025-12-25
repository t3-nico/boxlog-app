'use client';

import { ArrowUpDown } from 'lucide-react';

import { MobileSettingsRadioGroup, MobileSettingsSection } from '@/components/common';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';

import {
  useInboxSortStore,
  type SortDirection,
  type SortField,
} from '../../stores/useInboxSortStore';

interface MobileSortSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ソートフィールド選択肢
 * @note due_dateはSortField型に含まれていないため、利用可能なフィールドのみ表示
 */
const SORT_FIELD_OPTIONS: Array<{ value: SortField | 'none'; label: string }> = [
  { value: 'none', label: 'なし' },
  { value: 'title', label: 'タイトル' },
  { value: 'created_at', label: '作成日' },
  { value: 'updated_at', label: '更新日' },
  { value: 'status', label: 'ステータス' },
];

/**
 * ソート順選択肢
 */
const SORT_DIRECTION_OPTIONS: Array<{ value: SortDirection; label: string }> = [
  { value: 'asc', label: '昇順 (A → Z)' },
  { value: 'desc', label: '降順 (Z → A)' },
];

/**
 * モバイル用ソートシート
 *
 * Apple HIG準拠のボトムシート形式のソートUI
 */
export function MobileSortSheet({ open, onOpenChange }: MobileSortSheetProps) {
  const { sortField, sortDirection, setSort, clearSort } = useInboxSortStore();

  const handleFieldChange = (value: SortField | 'none') => {
    if (value === 'none') {
      clearSort();
    } else {
      setSort(value, sortDirection || 'asc');
    }
  };

  const handleDirectionChange = (value: SortDirection) => {
    if (sortField) {
      setSort(sortField, value);
    }
  };

  const handleReset = () => {
    clearSort();
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="ソート">
      <BottomSheetHeader>
        <BottomSheetTitle>ソート</BottomSheetTitle>
        {sortField && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-auto p-0 text-xs">
            リセット
          </Button>
        )}
      </BottomSheetHeader>

      <BottomSheetContent>
        <div className="space-y-6">
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
      </BottomSheetContent>
    </BottomSheet>
  );
}
