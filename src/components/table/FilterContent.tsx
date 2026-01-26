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
import { RotateCcw, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * フィルターオプションの型定義
 */
export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

/**
 * 単一選択フィルターの設定
 */
export interface RadioFilterConfig<T extends string> {
  type: 'radio';
  label: string;
  icon: LucideIcon;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  /** デフォルト値（バッジ表示判定用） */
  defaultValue?: T;
}

/**
 * 複数選択フィルターの設定
 */
export interface CheckboxFilterConfig {
  type: 'checkbox';
  label: string;
  icon: LucideIcon;
  selectedIds: string[];
  options: { id: string; label: string }[];
  onToggle: (id: string) => void;
  /** オプションがない場合のメッセージ */
  emptyMessage?: string;
}

/**
 * フィルター設定の型
 */
export type FilterConfig<T extends string = string> = RadioFilterConfig<T> | CheckboxFilterConfig;

interface FilterContentProps {
  /** フィルター設定の配列 */
  filters: FilterConfig[];
  /** フィルターがアクティブかどうか */
  hasActiveFilters: boolean;
  /** リセット時のコールバック */
  onReset: () => void;
  /** リセットボタンのラベル */
  resetLabel?: string;
  /** 追加のコンテンツ（子要素） */
  children?: ReactNode;
}

/**
 * 汎用フィルターコンテンツ
 *
 * DropdownMenu内で使用するフィルターUIを提供
 * - RadioGroupによる単一選択
 * - Checkboxによる複数選択
 * - リセット機能
 *
 * @example
 * ```tsx
 * <FilterContent
 *   filters={[
 *     {
 *       type: 'radio',
 *       label: '期限',
 *       icon: Calendar,
 *       value: dueDate,
 *       options: [
 *         { value: 'all', label: 'すべて' },
 *         { value: 'today', label: '今日' },
 *       ],
 *       onChange: setDueDate,
 *       defaultValue: 'all',
 *     },
 *     {
 *       type: 'checkbox',
 *       label: 'タグ',
 *       icon: Tag,
 *       selectedIds: selectedTags,
 *       options: tags.map(t => ({ id: t.id, label: t.name })),
 *       onToggle: handleTagToggle,
 *     },
 *   ]}
 *   hasActiveFilters={hasActiveFilters}
 *   onReset={reset}
 * />
 * ```
 */
export function FilterContent({
  filters,
  hasActiveFilters,
  onReset,
  resetLabel = 'フィルターをリセット',
  children,
}: FilterContentProps) {
  return (
    <>
      <DropdownMenuGroup>
        {filters.map((filter, index) => {
          const Icon = filter.icon;

          if (filter.type === 'radio') {
            const isActive =
              filter.defaultValue !== undefined
                ? filter.value !== filter.defaultValue
                : filter.value !== 'all';

            return (
              <DropdownMenuSub key={index}>
                <DropdownMenuSubTrigger>
                  <Icon />
                  <span className="flex-1">{filter.label}</span>
                  {isActive && (
                    <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                      1
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="border-input">
                  <DropdownMenuRadioGroup
                    value={filter.value}
                    onValueChange={(v) => filter.onChange(v as typeof filter.value)}
                  >
                    {filter.options.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          }

          if (filter.type === 'checkbox') {
            return (
              <DropdownMenuSub key={index}>
                <DropdownMenuSubTrigger>
                  <Icon />
                  <span className="flex-1">{filter.label}</span>
                  {filter.selectedIds.length > 0 && (
                    <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                      {filter.selectedIds.length}
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="border-input">
                  {filter.options.length > 0 ? (
                    filter.options.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.id}
                        checked={filter.selectedIds.includes(option.id)}
                        onCheckedChange={() => filter.onToggle(option.id)}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <div className="text-muted-foreground px-2 py-2 text-sm">
                      {filter.emptyMessage ?? 'オプションがありません'}
                    </div>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          }

          return null;
        })}

        {children}
      </DropdownMenuGroup>

      {hasActiveFilters && (
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
