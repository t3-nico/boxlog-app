import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * ソート方向
 */
export type SortDirection = 'asc' | 'desc'

/**
 * ソート方向（null許容版）
 */
export type SortDirectionNullable = SortDirection | null

/**
 * ソートストアの状態
 */
export interface TableSortState<TSortField extends string> {
  sortField: TSortField
  sortDirection: SortDirection
  setSortField: (field: TSortField) => void
  setSort: (field: TSortField, direction: SortDirection) => void
}

/**
 * ソートストアの状態（null許容版）
 */
export interface TableSortStateNullable<TSortField extends string> {
  sortField: TSortField | null
  sortDirection: SortDirectionNullable
  setSortField: (field: TSortField) => void
  setSort: (field: TSortField, direction: SortDirection) => void
  clearSort: () => void
}

/**
 * ソートストアのファクトリー設定
 */
export interface CreateTableSortStoreConfig<TSortField extends string> {
  /** デフォルトソートフィールド */
  defaultSortField: TSortField
  /** デフォルトソート方向 */
  defaultSortDirection: SortDirection
  /** localStorage 永続化キー（nullの場合は永続化しない） */
  persistKey?: string
  /** devtools 表示名 */
  storeName?: string
  /** ソート解除を許可するか（デフォルト: false） */
  allowClearSort?: boolean
}

/**
 * テーブルソートストアのファクトリー関数
 *
 * @example
 * ```typescript
 * // Tags用（永続化あり、ソート解除不可）
 * export const useTagSortStore = createTableSortStore({
 *   defaultSortField: 'created_at',
 *   defaultSortDirection: 'desc',
 *   persistKey: 'tag-sort-store-v1',
 * })
 *
 * // Inbox用（ソート解除可能）
 * export const useInboxSortStore = createTableSortStore({
 *   defaultSortField: 'created_at',
 *   defaultSortDirection: 'desc',
 *   allowClearSort: true,
 * })
 * ```
 */
export function createTableSortStore<TSortField extends string>(config: CreateTableSortStoreConfig<TSortField>) {
  const {
    defaultSortField,
    defaultSortDirection,
    persistKey,
    storeName = persistKey ?? 'table-sort-store',
    allowClearSort = false,
  } = config

  type StoreState = TableSortState<TSortField>

  const storeCreator = (set: (partial: Partial<StoreState>) => void, get: () => StoreState): StoreState => ({
    sortField: defaultSortField,
    sortDirection: defaultSortDirection,

    setSortField: (field: TSortField) => {
      const { sortField, sortDirection } = get()

      if (sortField === field) {
        if (allowClearSort) {
          // asc → desc → asc（解除はUI層で実装）
          set({
            sortDirection: sortDirection === 'asc' ? 'desc' : 'asc',
          })
        } else {
          // asc ↔ desc
          set({
            sortDirection: sortDirection === 'asc' ? 'desc' : 'asc',
          })
        }
      } else {
        set({ sortField: field, sortDirection: 'asc' })
      }
    },

    setSort: (field: TSortField, direction: SortDirection) => {
      set({ sortField: field, sortDirection: direction })
    },
  })

  if (persistKey) {
    return create<StoreState>()(devtools(persist(storeCreator, { name: persistKey }), { name: storeName }))
  }

  return create<StoreState>()(devtools(storeCreator, { name: storeName }))
}
