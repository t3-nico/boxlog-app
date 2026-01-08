import { useEffect, useState } from 'react';

/** 行の高さ（h-12 = 48px） */
const ROW_HEIGHT = 48;

/** テーブルヘッダーの高さ */
const HEADER_HEIGHT = 48;

/** 最小ページサイズ */
const MIN_PAGE_SIZE = 5;

/** デフォルトページサイズ（初回レンダリング用） */
const DEFAULT_PAGE_SIZE = 25;

/**
 * コンテナの高さに基づいて動的にページサイズを計算するフック
 *
 * ResizeObserver を使用してコンテナサイズの変更を監視し、
 * 利用可能な高さから表示可能な行数を自動計算する。
 *
 * @param containerRef - テーブルコンテナの ref
 * @returns 計算されたページサイズ
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const pageSize = useDynamicPageSize(containerRef);
 *
 * return (
 *   <div ref={containerRef}>
 *     <Table items={items.slice(0, pageSize)} />
 *   </div>
 * );
 * ```
 */
export function useDynamicPageSize(containerRef: React.RefObject<HTMLElement | null>): number {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const updatePageSize = () => {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const availableHeight = containerHeight - HEADER_HEIGHT;
      const calculatedSize = Math.max(MIN_PAGE_SIZE, Math.floor(availableHeight / ROW_HEIGHT));

      setPageSize(calculatedSize);
    };

    // 初回計算
    updatePageSize();

    // リサイズ監視
    const resizeObserver = new ResizeObserver(updatePageSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return pageSize;
}
