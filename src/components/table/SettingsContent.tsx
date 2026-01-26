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
import { Columns3, Group, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * グループ化オプションの型定義
 */
export interface GroupByOption<T extends string | null> {
  value: T;
  label: string;
}

/**
 * 列設定の型定義
 */
export interface ColumnSetting {
  id: string;
  label: string;
  visible: boolean;
}

interface SettingsContentProps<T extends string | null = string | null> {
  /** グループ化の現在値 */
  groupBy: T;
  /** グループ化のオプション */
  groupByOptions: GroupByOption<T>[];
  /** グループ化変更時のコールバック */
  onGroupByChange: (value: T) => void;
  /** 列設定の配列 */
  columns: ColumnSetting[];
  /** 列の表示切り替え時のコールバック */
  onToggleColumnVisibility: (columnId: string) => void;
  /** 設定がアクティブかどうか */
  hasActiveSettings: boolean;
  /** リセット時のコールバック */
  onReset: () => void;
  /** グループ化ラベル */
  groupByLabel?: string;
  /** 列の表示ラベル */
  columnsLabel?: string;
  /** リセットボタンのラベル */
  resetLabel?: string;
  /** 追加のコンテンツ（子要素） */
  children?: ReactNode;
}

/**
 * 汎用設定コンテンツ
 *
 * DropdownMenu内で使用するテーブル設定UIを提供
 * - グループ化設定
 * - 列の表示設定
 * - リセット機能
 *
 * @example
 * ```tsx
 * <SettingsContent
 *   groupBy={groupBy}
 *   groupByOptions={[
 *     { value: null, label: 'なし' },
 *     { value: 'status', label: 'ステータス' },
 *     { value: 'due_date', label: '期限' },
 *   ]}
 *   onGroupByChange={setGroupBy}
 *   columns={columns.map(col => ({
 *     id: col.id,
 *     label: col.label,
 *     visible: col.visible,
 *   }))}
 *   onToggleColumnVisibility={toggleColumnVisibility}
 *   hasActiveSettings={groupBy !== null || hiddenColumnCount > 0}
 *   onReset={handleReset}
 * />
 * ```
 */
export function SettingsContent<T extends string | null = string | null>({
  groupBy,
  groupByOptions,
  onGroupByChange,
  columns,
  onToggleColumnVisibility,
  hasActiveSettings,
  onReset,
  groupByLabel = 'グループ化',
  columnsLabel = '列の表示',
  resetLabel = '設定をリセット',
  children,
}: SettingsContentProps<T>) {
  // 非表示の列数をカウント
  const hiddenColumnCount = columns.filter((col) => !col.visible).length;

  return (
    <>
      <DropdownMenuGroup>
        {/* グループ化 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Group />
            <span className="flex-1">{groupByLabel}</span>
            {groupBy !== null && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={groupBy ?? ''}
              onValueChange={(v) => onGroupByChange((v === '' ? null : v) as T)}
            >
              {groupByOptions.map((option) => (
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
            <span className="flex-1">{columnsLabel}</span>
            {hiddenColumnCount > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                {hiddenColumnCount}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => onToggleColumnVisibility(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {children}
      </DropdownMenuGroup>

      {/* リセットボタン（設定がアクティブな場合のみ表示） */}
      {hasActiveSettings && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onReset}>
            <RotateCcw />
            {resetLabel}
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
