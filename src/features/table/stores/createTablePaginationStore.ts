import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * ページネーションストアの状態
 */
export interface TablePaginationState {
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  reset: () => void
}

/**
 * ページネーションストアのファクトリー設定
 */
export interface CreateTablePaginationStoreConfig {
  /** デフォルトページサイズ（デフォルト: 25） */
  defaultPageSize?: number
  /** localStorage 永続化キー（nullの場合は永続化しない） */
  persistKey?: string
  /** devtools 表示名 */
  storeName?: string
}

/**
 * テーブルページネーションストアのファクトリー関数
 *
 * @example
 * ```typescript
 * export const useInboxPaginationStore = createTablePaginationStore({
 *   defaultPageSize: 25,
 *   storeName: 'inbox-pagination-store',
 * })
 *
 * export const useTagPaginationStore = createTablePaginationStore({
 *   defaultPageSize: 50,
 *   persistKey: 'tag-pagination-store-v1',
 * })
 * ```
 */
export function createTablePaginationStore(config: CreateTablePaginationStoreConfig = {}) {
  const {
    defaultPageSize = 25,
    persistKey,
    storeName = persistKey ?? 'table-pagination-store',
  } = config

  const storeCreator = (set: (partial: Partial<TablePaginationState>) => void) => ({
    currentPage: 1,
    pageSize: defaultPageSize,

    setCurrentPage: (page: number) => set({ currentPage: page }),
    setPageSize: (size: number) => set({ pageSize: size, currentPage: 1 }),
    reset: () => set({ currentPage: 1, pageSize: defaultPageSize }),
  })

  if (persistKey) {
    return create<TablePaginationState>()(
      devtools(
        persist(storeCreator, { name: persistKey }),
        { name: storeName }
      )
    )
  }

  return create<TablePaginationState>()(
    devtools(storeCreator, { name: storeName })
  )
}
