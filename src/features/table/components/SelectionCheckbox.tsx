'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { TableHead } from '@/components/ui/table';

export interface SelectionHeaderProps {
  /** 全選択状態 */
  allSelected: boolean;
  /** 一部選択状態 */
  someSelected: boolean;
  /** 全選択/解除コールバック */
  onToggleAll: () => void;
  /** 幅（デフォルト: 50） */
  width?: number;
}

/**
 * テーブルヘッダーの選択チェックボックス
 *
 * @example
 * ```tsx
 * <SelectionHeader
 *   allSelected={allSelected}
 *   someSelected={someSelected}
 *   onToggleAll={handleToggleAll}
 * />
 * ```
 */
export function SelectionHeader({
  allSelected,
  someSelected,
  onToggleAll,
  width = 50,
}: SelectionHeaderProps) {
  return (
    <TableHead style={{ width: `${width}px`, minWidth: `${width}px` }}>
      <Checkbox
        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
        onCheckedChange={onToggleAll}
      />
    </TableHead>
  );
}

export interface SelectionCellProps {
  /** 選択状態 */
  selected: boolean;
  /** 選択トグルコールバック */
  onToggle: () => void;
  /** 無効化 */
  disabled?: boolean;
}

/**
 * テーブル行の選択チェックボックス
 *
 * @example
 * ```tsx
 * <SelectionCell
 *   selected={isSelected(item.id)}
 *   onToggle={() => toggleSelection(item.id)}
 * />
 * ```
 */
export function SelectionCell({ selected, onToggle, disabled = false }: SelectionCellProps) {
  return (
    <Checkbox
      checked={selected}
      onCheckedChange={onToggle}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
