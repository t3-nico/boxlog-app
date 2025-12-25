import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Inspector リサイズのデフォルト設定
 */
export const INSPECTOR_SIZE = {
  /** デフォルト幅 */
  default: 540,
  /** 最小幅 */
  min: 400,
  /** 最大幅 */
  max: 800,
} as const;

interface UseInspectorResizeOptions {
  /** 初期幅（デフォルト: 540px） */
  initialWidth?: number;
  /** 最小幅（デフォルト: 400px） */
  minWidth?: number;
  /** 最大幅（デフォルト: 800px） */
  maxWidth?: number;
  /** リサイズが有効か */
  enabled?: boolean;
}

interface UseInspectorResizeReturn {
  /** 現在のInspector幅 */
  inspectorWidth: number;
  /** リサイズ中かどうか */
  isResizing: boolean;
  /** マウスダウンハンドラー（リサイズハンドル用） */
  handleMouseDown: (e: React.MouseEvent) => void;
  /** 幅をリセット */
  resetWidth: () => void;
}

/**
 * Inspector リサイズ機能を提供するhook
 *
 * @example
 * ```tsx
 * const { inspectorWidth, isResizing, handleMouseDown } = useInspectorResize()
 *
 * <Sheet>
 *   <SheetContent style={{ width: `${inspectorWidth}px` }}>
 *     <div
 *       onMouseDown={handleMouseDown}
 *       className={`absolute left-0 top-0 h-full w-1 cursor-ew-resize ${isResizing ? 'bg-primary' : ''}`}
 *     />
 *     {children}
 *   </SheetContent>
 * </Sheet>
 * ```
 */
export function useInspectorResize(
  options: UseInspectorResizeOptions = {},
): UseInspectorResizeReturn {
  const {
    initialWidth = INSPECTOR_SIZE.default,
    minWidth = INSPECTOR_SIZE.min,
    maxWidth = INSPECTOR_SIZE.max,
    enabled = true,
  } = options;

  const [inspectorWidth, setInspectorWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(initialWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = inspectorWidth;
    },
    [enabled, inspectorWidth],
  );

  const resetWidth = useCallback(() => {
    setInspectorWidth(initialWidth);
  }, [initialWidth]);

  useEffect(() => {
    if (!isResizing || !enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 左方向にドラッグすると幅が増える（右側に固定されているため）
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
      setInspectorWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, enabled, minWidth, maxWidth]);

  return {
    inspectorWidth,
    isResizing,
    handleMouseDown,
    resetWidth,
  };
}
