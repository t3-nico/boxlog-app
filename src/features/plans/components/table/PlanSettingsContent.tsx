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
import { useTableColumnStore, useTableGroupStore, type GroupByField } from '@/features/table';
import { Columns3, Group, RotateCcw } from 'lucide-react';

/**
 * グループ化オプション
 */
const GROUP_BY_OPTIONS: Array<{ value: GroupByField; label: string }> = [
  { value: null, label: 'なし' },
  { value: 'status', label: 'ステータス' },
  { value: 'due_date', label: '期限' },
  { value: 'tags', label: 'タグ' },
];

/**
 * Plan設定コンテンツ
 *
 * Linear/Account.tsx風の2カラム構造
 * - DropdownMenuSub でカテゴリ → サブメニュー
 * - グループ化: RadioGroup（単一選択）
 * - 列の表示: CheckboxItem（複数選択）
 */
export function PlanSettingsContent() {
  // グループ化
  const { groupBy, setGroupBy } = useTableGroupStore();

  // 列設定
  const { columns, toggleColumnVisibility, resetColumns } = useTableColumnStore();
  const configurableColumns = columns.filter((col) => col.id !== 'selection');

  // 非表示の列数をカウント
  const hiddenColumnCount = configurableColumns.filter((col) => !col.visible).length;

  // 設定がアクティブかどうか
  const hasActiveSettings = groupBy !== null || hiddenColumnCount > 0;

  // リセット
  const handleReset = () => {
    setGroupBy(null);
    resetColumns();
  };

  return (
    <>
      <DropdownMenuGroup>
        {/* グループ化 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Group />
            <span className="flex-1">グループ化</span>
            {groupBy !== null && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={groupBy ?? ''}
              onValueChange={(v) => setGroupBy((v === '' ? null : v) as GroupByField)}
            >
              {GROUP_BY_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value ?? 'none'} value={option.value ?? ''}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 列の表示 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Columns3 />
            <span className="flex-1">列の表示</span>
            {hiddenColumnCount > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                {hiddenColumnCount}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            {configurableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => toggleColumnVisibility(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      {/* リセットボタン（設定がアクティブな場合のみ表示） */}
      {hasActiveSettings && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReset}>
            <RotateCcw />
            設定をリセット
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
