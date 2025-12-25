'use client';

import type { ReactNode } from 'react';

import { SelectionBar } from '@/components/common/SelectionBar';

interface InboxSelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: ReactNode;
}

/**
 * Inbox選択バー（共通SelectionBarのラッパー）
 *
 * @deprecated 共通SelectionBarを直接使用することを推奨
 */
export function InboxSelectionBar({
  selectedCount,
  onClearSelection,
  actions,
}: InboxSelectionBarProps) {
  return (
    <SelectionBar
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      actions={actions}
    />
  );
}
