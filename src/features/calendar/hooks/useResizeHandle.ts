import { useCallback, useEffect, useRef, useState } from 'react';

/** パネル最小幅（コンテナ幅に対する%） */
const MIN_PANEL_PERCENT = 25;
/** パネル最大幅（コンテナ幅に対する%） */
const MAX_PANEL_PERCENT = 40;

interface UseResizeHandleOptions {
  /** 現在のパネル幅（%） */
  initialPercent: number;
  /** リサイズ完了時のコールバック（%値） */
  onResizeEnd: (percent: number) => void;
}

/**
 * サイドパネルのドラッグリサイズを制御するフック
 *
 * マウスドラッグでパネル幅を変更。ドラッグ中はリアルタイムで%を更新し、
 * ドラッグ終了時に onResizeEnd でストアに永続化する。
 */
export function useResizeHandle({ initialPercent, onResizeEnd }: UseResizeHandleOptions) {
  const [percent, setPercent] = useState(initialPercent);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // initialPercent が外部（store hydration）から変わった場合に同期
  useEffect(() => {
    if (!isResizing) {
      setPercent(initialPercent);
    }
  }, [initialPercent, isResizing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      setIsResizing(true);

      const startX = e.clientX;
      const containerWidth = container.offsetWidth;
      const startPercent = percent;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // ハンドルを左に動かす → パネルが広がる（右端固定のため）
        const deltaPx = startX - moveEvent.clientX;
        const deltaPercent = (deltaPx / containerWidth) * 100;
        const newPercent = Math.min(
          MAX_PANEL_PERCENT,
          Math.max(MIN_PANEL_PERCENT, startPercent + deltaPercent),
        );
        setPercent(Math.round(newPercent * 10) / 10);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // 最終的な%をストアに保存
        const aside = container.querySelector('aside');
        if (aside && containerWidth > 0) {
          const finalPercent = Math.round((aside.offsetWidth / containerWidth) * 100 * 10) / 10;
          onResizeEnd(finalPercent);
        }
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [percent, onResizeEnd],
  );

  return {
    /** パネル幅（%） */
    percent,
    isResizing,
    handleMouseDown,
    containerRef,
  };
}
