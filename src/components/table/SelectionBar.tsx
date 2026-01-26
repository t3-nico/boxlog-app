'use client';

import type { ReactNode } from 'react';

import { SelectionBar as BaseSelectionBar } from '@/components/common/SelectionBar';

interface SelectionBarProps {
  /** 選択されたアイテム数 */
  selectedCount: number;
  /** 選択解除時のコールバック */
  onClearSelection: () => void;
  /** アクションボタン群 */
  actions: ReactNode;
}

/**
 * 汎用選択バー
 *
 * テーブルでアイテムを選択した時に表示されるツールバー
 * - 選択数表示
 * - 選択解除ボタン
 * - アクションボタン群
 *
 * @example
 * ```tsx
 * <SelectionBar
 *   selectedCount={selectedIds.size}
 *   onClearSelection={clearSelection}
 *   actions={
 *     <SelectionActions
 *       selectedCount={selectedIds.size}
 *       actions={[...]}
 *       onDelete={handleDelete}
 *       onClearSelection={clearSelection}
 *     />
 *   }
 * />
 * ```
 */
export function SelectionBar({ selectedCount, onClearSelection, actions }: SelectionBarProps) {
  return (
    <BaseSelectionBar
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      actions={actions}
    />
  );
}
