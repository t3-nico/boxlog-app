'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizeHandleProps {
  columnId: string;
  currentWidth: number;
  onResize: (columnId: string, newWidth: number) => void;
}

export function ResizeHandle({ columnId, currentWidth, onResize }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // リスナー参照を保持してクリーンアップを保証
  const handlersRef = useRef<{
    onMouseMove: ((e: MouseEvent) => void) | null;
    onMouseUp: (() => void) | null;
  }>({ onMouseMove: null, onMouseUp: null });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = currentWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        onResize(columnId, Math.max(50, startWidthRef.current + delta));
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        handlersRef.current = { onMouseMove: null, onMouseUp: null };
      };

      // 参照を保存
      handlersRef.current = { onMouseMove, onMouseUp };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [columnId, currentWidth, onResize],
  );

  // アンマウント時のクリーンアップを保証
  useEffect(() => {
    return () => {
      const { onMouseMove, onMouseUp } = handlersRef.current;
      if (onMouseMove) {
        document.removeEventListener('mousemove', onMouseMove);
      }
      if (onMouseUp) {
        document.removeEventListener('mouseup', onMouseUp);
      }
    };
  }, []);

  return (
    <div
      className={`hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize ${
        isResizing ? 'bg-primary' : ''
      }`}
      onMouseDown={onMouseDown}
      style={{ userSelect: 'none' }}
    />
  );
}
