'use client';

import { useDraggable } from '@dnd-kit/core';
import { forwardRef, useCallback, type ReactNode } from 'react';

import { TableRow } from '@/components/ui/table';

interface DraggableTagRowProps {
  id: string;
  children: ReactNode;
  className?: string;
  onContextMenu?: () => void;
}

/**
 * ドラッグ可能なタグ行コンポーネント
 *
 * タグテーブルの各行をラップし、グループへのドラッグ&ドロップを可能にする
 */
export const DraggableTagRow = forwardRef<HTMLTableRowElement, DraggableTagRowProps>(
  ({ id, children, className, onContextMenu }, forwardedRef) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id,
      data: {
        type: 'tag',
      },
    });

    // Merge refs
    const mergeRefs = useCallback(
      (node: HTMLTableRowElement | null) => {
        setNodeRef(node);
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, setNodeRef],
    );

    return (
      <TableRow
        ref={mergeRefs}
        className={`${className ?? ''} ${isDragging ? 'opacity-50' : ''}`}
        onContextMenu={onContextMenu}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        {...listeners}
        {...attributes}
      >
        {children}
      </TableRow>
    );
  },
);

DraggableTagRow.displayName = 'DraggableTagRow';
