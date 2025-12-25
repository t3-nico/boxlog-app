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

interface TableSortSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc' | null;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onSortClear: () => void;
  fieldOptions: Array<{ value: string; label: string }>;
}

/**
 * ソート順選択肢
 */
const SORT_DIRECTION_OPTIONS: Array<{ value: 'asc' | 'desc'; label: string }> = [
  { value: 'asc', label: '昇順 (A → Z)' },
  { value: 'desc', label: '降順 (Z → A)' },
];

/**
 * テーブル用ソートシート
 *
 * Apple HIG準拠のボトムシート形式のソートUI
 */
export function TableSortSheet({
  open,
  onOpenChange,
  sortField,
  sortDirection,
  onSortChange,
  onSortClear,
  fieldOptions,
}: TableSortSheetProps) {
  // 'none'を追加したフィールドオプション
  const allFieldOptions = [{ value: 'none', label: 'なし' }, ...fieldOptions];

  const handleFieldChange = (value: string) => {
    if (value === 'none') {
      onSortClear();
    } else {
      onSortChange(value, sortDirection || 'asc');
    }
  };

  const handleDirectionChange = (value: 'asc' | 'desc') => {
    if (sortField) {
      onSortChange(sortField, value);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="ソート">
      <BottomSheetHeader>
        <BottomSheetTitle>ソート</BottomSheetTitle>
        {sortField && (
          <Button variant="ghost" size="sm" onClick={onSortClear} className="h-auto p-0 text-xs">
            リセット
          </Button>
        )}
      </BottomSheetHeader>

      <BottomSheetContent>
        <div className="space-y-6">
          {/* ソートフィールド */}
          <MobileSettingsSection icon={<ArrowUpDown />} title="並び替えの基準">
            <MobileSettingsRadioGroup
              options={allFieldOptions}
              value={sortField || 'none'}
              onValueChange={handleFieldChange}
              idPrefix="table-sort-field"
            />
          </MobileSettingsSection>

          {/* ソート順（フィールドが選択されている場合のみ） */}
          {sortField && (
            <MobileSettingsSection icon={<ArrowUpDown />} title="並び順" showSeparator={false}>
              <MobileSettingsRadioGroup
                options={SORT_DIRECTION_OPTIONS}
                value={sortDirection || 'asc'}
                onValueChange={handleDirectionChange}
                idPrefix="table-sort-direction"
              />
            </MobileSettingsSection>
          )}
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
