import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Inboxページネーション状態
 */
interface InboxPaginationState {
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  reset: () => void
}

/**
 * Inboxページネーションストア
 *
 * テーブルビューのページネーション状態を管理
 * - currentPage: 現在のページ番号（1始まり）
 * - pageSize: 1ページあたりの表示件数
 *
 * @example
 * ```tsx
 * const { currentPage, pageSize, setCurrentPage, setPageSize } = useInboxPaginationStore()
 *
 * // ページ切り替え
 * setCurrentPage(2)
 *
 * // 表示件数変更
 * setPageSize(50)
 * ```
 */
export const useInboxPaginationStore = create<InboxPaginationState>()(
  devtools(
    (set) => ({
      currentPage: 1,
      pageSize: 25,

      setCurrentPage: (page) => set({ currentPage: page }),
      setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
      reset: () => set({ currentPage: 1, pageSize: 25 }),
    }),
    { name: 'inbox-pagination-store' }
  )
)
