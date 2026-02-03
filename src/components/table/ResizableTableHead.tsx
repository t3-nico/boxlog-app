'use client';

import { TableHead } from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface ResizableTableHeadProps {
  /** 現在の列幅 */
  width: number;
  /** リサイズ可能かどうか */
  resizable?: boolean;
  /** 表示ラベル */
  children: React.ReactNode;
  /** カスタムクラス名 */
  className?: string;
  /** ソート可能かどうか */
  sortable?: boolean;
  /** 現在このフィールドでソート中かどうか */
  isSorting?: boolean;
  /** ソート方向（'asc' | 'desc'） */
  sortDirection?: 'asc' | 'desc';
  /** ソートクリック時のコールバック */
  onSort?: () => void;
  /** リサイズ時のコールバック */
  onResize?: (newWidth: number) => void;
  /** 列アイコン */
  icon?: LucideIcon;
}

/**
 * リサイズ可能なテーブルヘッダー
 *
 * 列境界をドラッグして幅を調整可能
 * - マウス/タッチドラッグで列幅を調整
 * - 最小幅50pxを保証
 * - ソート機能も統合
 *
 * @example
 * ```tsx
 * <ResizableTableHead
 *   width={200}
 *   resizable
 *   sortable
 *   isSorting={sortField === 'title'}
 *   sortDirection={sortDirection}
 *   onSort={() => setSortField('title')}
 *   onResize={(w) => setColumnWidth('title', w)}
 *   icon={FileText}
 * >
 *   タイトル
 * </ResizableTableHead>
 * ```
 */
export function ResizableTableHead({
  width,
  resizable = true,
  children,
  className,
  sortable = false,
  isSorting = false,
  sortDirection,
  onSort,
  onResize,
  icon: ColumnIcon,
}: ResizableTableHeadProps) {
  const [isResizing, setIsResizing] = useState(false);

  // ソートアイコン
  const Icon = isSorting ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  // リサイズ開始（マウス・タッチ共通）
  const startResize = (startX: number) => {
    if (!resizable || !onResize) return;

    setIsResizing(true);
    const startWidth = width;

    const handleMove = (clientX: number) => {
      const diff = clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      onResize(newWidth);
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
    if (!resizable || !onResize) return;
    e.preventDefault();
    startResize(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!resizable || !onResize) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    startResize(touch.clientX);
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
        {sortable && onSort ? (
          <button
            type="button"
            onClick={onSort}
            className="hover:bg-state-hover -ml-1 flex min-w-0 items-center gap-1 rounded-lg px-1 py-1 transition-colors"
          >
            {ColumnIcon && <ColumnIcon className="text-muted-foreground size-4 shrink-0" />}
            <span className="truncate">{children}</span>
            <Icon
              className={`size-4 shrink-0 ${isSorting ? 'text-foreground' : 'text-muted-foreground'}`}
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
      {resizable && onResize && (
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
