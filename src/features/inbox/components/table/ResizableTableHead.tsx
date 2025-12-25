'use client';

import { TableHead } from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ColumnId } from '../../stores/useInboxColumnStore';
import { useInboxColumnStore } from '../../stores/useInboxColumnStore';
import type { SortField } from '../../stores/useInboxSortStore';
import { useInboxSortStore } from '../../stores/useInboxSortStore';

interface ResizableTableHeadProps {
  /** 列ID */
  columnId: ColumnId;
  /** 表示ラベル */
  children: React.ReactNode;
  /** カスタムクラス名 */
  className?: string;
  /** ソート可能な列のフィールド名 */
  sortField?: SortField;
  /** 列アイコン */
  icon?: LucideIcon;
}

/**
 * リサイズ可能なテーブルヘッダー
 *
 * 列境界をドラッグして幅を調整可能
 * - マウスドラッグで列幅を調整
 * - 最小幅50pxを保証
 * - リサイズ不可の列はリサイズハンドルを表示しない
 * - ソート機能も統合
 *
 * @example
 * ```tsx
 * <ResizableTableHead columnId="title" sortField="title">
 *   タイトル
 * </ResizableTableHead>
 * ```
 */
export function ResizableTableHead({
  columnId,
  children,
  className,
  sortField,
  icon: ColumnIcon,
}: ResizableTableHeadProps) {
  const { columns, setColumnWidth } = useInboxColumnStore();
  const { sortField: currentSortField, sortDirection, setSortField } = useInboxSortStore();
  const [isResizing, setIsResizing] = useState(false);

  const column = columns.find((col) => col.id === columnId);
  if (!column) return null;

  const { width, resizable } = column;

  // ソートアイコン
  const isActive = sortField && currentSortField === sortField;
  const Icon = isActive ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  // リサイズ開始（マウス・タッチ共通）
  const startResize = (startX: number) => {
    if (!resizable) return;

    setIsResizing(true);
    const startWidth = width;

    const handleMove = (clientX: number) => {
      const diff = clientX - startX;
      const newWidth = startWidth + diff;
      setColumnWidth(columnId, newWidth);
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleMove(moveEvent.clientX);
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const touch = moveEvent.touches[0];
      if (!touch) return;
      handleMove(touch.clientX);
    };

    const handleEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    e.preventDefault();
    startResize(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!resizable) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    startResize(touch.clientX);
  };

  // ソートハンドラー
  const handleSort = () => {
    if (sortField) {
      setSortField(sortField);
    }
  };

  return (
    <TableHead
      className={className}
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        position: 'relative',
        maxWidth: `${width}px`,
      }}
    >
      <div className="flex items-center gap-1">
        {sortField ? (
          <button
            type="button"
            onClick={handleSort}
            className="hover:bg-state-hover -ml-1 flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 transition-colors"
          >
            {ColumnIcon && <ColumnIcon className="text-muted-foreground size-4 shrink-0" />}
            <span className="truncate">{children}</span>
            <Icon
              className={`size-4 shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
            />
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-1">
            {ColumnIcon && <ColumnIcon className="text-muted-foreground size-4 shrink-0" />}
            <span className="truncate">{children}</span>
          </div>
        )}
      </div>

      {/* リサイズハンドル（タッチ対応） */}
      {resizable && (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`hover:bg-primary absolute top-0 right-0 h-full w-2 cursor-col-resize touch-none transition-colors sm:w-1 ${
            isResizing ? 'bg-primary' : 'bg-transparent'
          }`}
          style={{ userSelect: 'none' }}
        />
      )}
    </TableHead>
  );
}
