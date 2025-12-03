import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * タグページネーション状態
 */
interface TagPaginationState {
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  reset: () => void
}

/**
 * タグページネーションストア
 *
 * テーブルビューのページネーション状態を管理
 * - currentPage: 現在のページ番号（1始まり）
 * - pageSize: 1ページあたりの表示件数
 */
export const useTagPaginationStore = create<TagPaginationState>()(
  devtools(
    persist(
      (set) => ({
        currentPage: 1,
        pageSize: 50,

        setCurrentPage: (page) => set({ currentPage: page }),
        setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
        reset: () => set({ currentPage: 1, pageSize: 50 }),
      }),
      {
        name: 'tag-pagination-store-v1',
      }
    ),
    { name: 'tag-pagination-store' }
  )
)
