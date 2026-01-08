import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * テーブルページネーション状態
 *
 * ページサイズは動的計算（useDynamicPageSize）に移行したため、
 * currentPageのみを管理
 */
interface TablePaginationState {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  reset: () => void;
}

/**
 * テーブルページネーションストア
 *
 * テーブルビューのページネーション状態を管理
 * - currentPage: 現在のページ番号（1始まり）
 *
 * NOTE: pageSizeは動的計算（useDynamicPageSize）に移行
 *
 * @example
 * ```tsx
 * const { currentPage, setCurrentPage } = useTablePaginationStore()
 *
 * // ページ切り替え
 * setCurrentPage(2)
 * ```
 */
export const useTablePaginationStore = create<TablePaginationState>()(
  devtools(
    (set) => ({
      currentPage: 1,

      setCurrentPage: (page) => set({ currentPage: page }),
      reset: () => set({ currentPage: 1 }),
    }),
    { name: 'table-pagination-store' },
  ),
);

// 後方互換性のためのエイリアス
export const useInboxPaginationStore = useTablePaginationStore;
