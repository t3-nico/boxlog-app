import { createTablePaginationStore } from '@/features/table';

/**
 * タグページネーションストア
 *
 * features/table の createTablePaginationStore を使用
 * - currentPage: 現在のページ番号（1始まり）
 * - pageSize: 1ページあたりの表示件数（デフォルト: 50）
 * - localStorageに永続化
 */
export const useTagPaginationStore = createTablePaginationStore({
  defaultPageSize: 50,
  persistKey: 'tag-pagination-store-v1',
  storeName: 'tag-pagination-store',
});
