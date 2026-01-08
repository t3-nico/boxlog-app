'use client';

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import {
  type DateRangeFilter,
  type UsageFilter,
  useTagFilterStore,
} from '@/features/tags/stores/useTagFilterStore';
import { BarChart3, Calendar, FolderTree, RotateCcw } from 'lucide-react';

/**
 * 使用状況フィルター選択肢
 */
const USAGE_OPTIONS: Array<{ value: UsageFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'unused', label: '未使用' },
  { value: 'frequently_used', label: 'よく使う' },
];

/**
 * 日付範囲フィルター選択肢
 */
const DATE_RANGE_OPTIONS: Array<{ value: DateRangeFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '今週' },
  { value: 'this_month', label: '今月' },
];

/**
 * タグフィルターコンテンツ
 *
 * Linear/Account.tsx風の2カラム構造
 * - DropdownMenuSub でカテゴリ → サブメニュー
 * - 使用状況・作成日: RadioGroup（単一選択）
 * - グループ: CheckboxItem（複数選択）
 */
export function TagsFilterContent() {
  const {
    usage,
    setUsage,
    groups: selectedGroups,
    toggleGroup,
    createdAt,
    setCreatedAt,
    reset,
  } = useTagFilterStore();
  const { data: allGroups } = useTagGroups();

  // フィルターがアクティブかどうか
  const hasActiveFilters = usage !== 'all' || selectedGroups.length > 0 || createdAt !== 'all';

  return (
    <>
      <DropdownMenuGroup>
        {/* 使用状況フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BarChart3 />
            <span className="flex-1">使用状況</span>
            {usage !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup value={usage} onValueChange={(v) => setUsage(v as UsageFilter)}>
              {USAGE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* グループフィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderTree />
            <span className="flex-1">グループ</span>
            {selectedGroups.length > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                {selectedGroups.length}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            {allGroups && allGroups.length > 0 ? (
              allGroups.map((group) => (
                <DropdownMenuCheckboxItem
                  key={group.id}
                  checked={selectedGroups.includes(group.id)}
                  onCheckedChange={() => toggleGroup(group.id)}
                >
                  {group.name}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="text-muted-foreground px-2 py-2 text-sm">グループがありません</div>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 作成日フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar />
            <span className="flex-1">作成日</span>
            {createdAt !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={createdAt}
              onValueChange={(v) => setCreatedAt(v as DateRangeFilter)}
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      {/* リセットボタン（フィルターがアクティブな場合のみ表示） */}
      {hasActiveFilters && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={reset}>
            <RotateCcw />
            フィルターをリセット
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
