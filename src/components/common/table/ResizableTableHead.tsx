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
 * リサイズ可能なテーブルヘッダー（共通コンポーネント）
 *
 * 列境界をドラッグして幅を調整可能
 * - マウスドラッグで列幅を調整
 * - 最小幅50pxを保証
 * - ソート機能も統合
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

  // リサイズ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !onResize) return;

    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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

      {/* リサイズハンドル */}
      {resizable && onResize && (
        <div
          onMouseDown={handleMouseDown}
          className={`hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors ${
            isResizing ? 'bg-primary' : 'bg-transparent'
          }`}
          style={{ userSelect: 'none' }}
        />
      )}
    </TableHead>
  );
}
