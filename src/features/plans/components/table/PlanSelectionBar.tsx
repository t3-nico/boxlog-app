'use client';

import type { ReactNode } from 'react';

import { SelectionBar } from '@/components/common/SelectionBar';

interface PlanSelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: ReactNode;
}

/**
 * Plan選択バー（共通SelectionBarのラッパー）
 *
 * @deprecated 共通SelectionBarを直接使用することを推奨
 */
export function PlanSelectionBar({
  selectedCount,
  onClearSelection,
  actions,
}: PlanSelectionBarProps) {
  return (
    <SelectionBar
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      actions={actions}
    />
  );
}
