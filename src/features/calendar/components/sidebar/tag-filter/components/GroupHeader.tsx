'use client';

import { useCallback } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface GroupHeaderProps {
  label: string;
  checked: boolean;
  indeterminate: boolean;
  count: number;
  onCheckedChange: () => void;
  onShowOnlyGroup: () => void;
}

/**
 * コロン記法グループのヘッダー行
 *
 * プレフィックス名 + 一括チェック + 件数合計
 */
export function GroupHeader({
  label,
  checked,
  indeterminate,
  count,
  onCheckedChange,
  onShowOnlyGroup,
}: GroupHeaderProps) {
  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
      onCheckedChange();
    },
    [onCheckedChange],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onShowOnlyGroup();
    },
    [onShowOnlyGroup],
  );

  return (
    <div
      className={cn(
        'group/item hover:bg-state-hover flex h-8 w-full min-w-0 cursor-pointer items-center rounded text-sm font-medium',
      )}
      onClick={handleRowClick}
      onContextMenu={handleContextMenu}
    >
      <Checkbox
        checked={indeterminate ? 'indeterminate' : checked}
        onCheckedChange={onCheckedChange}
        className="ml-2 shrink-0 cursor-pointer"
      />
      <span className="ml-1 min-w-0 flex-1 truncate">{label}</span>
      {count > 0 && (
        <span className="text-muted-foreground ml-1 shrink-0 pr-2 text-xs tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}
