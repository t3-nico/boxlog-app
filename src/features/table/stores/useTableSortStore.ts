import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { SortDirection, SortField } from '../types/sort'

/**
 * テーブルソート状態
 */
interface TableSortState {
  sortField: SortField | null
  sortDirection: SortDirection
  setSortField: (field: SortField) => void
  setSort: (field: string, direction: 'asc' | 'desc') => void
  clearSort: () => void
}

/**
 * テーブルソートストア
 *
 * テーブルヘッダークリックでソート状態を管理
 * asc → desc → null の順で切り替わる
 *
 * @example
 * ```tsx
 * const { sortField, sortDirection, setSortField } = useTableSortStore()
 *
 * // ソート切り替え
 * setSortField('title')
 * ```
 */
export const useTableSortStore = create<TableSortState>()(
  devtools(
    (set, get) => ({
      sortField: null,
      sortDirection: null,

      setSortField: (field) => {
        const { sortField, sortDirection } = get()

        if (sortField === field) {
          // 同じフィールド: asc → desc → null
          set({
            sortDirection: sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc',
            sortField: sortDirection === 'desc' ? null : field,
          })
        } else {
          // 別フィールド: asc から開始
          set({ sortField: field, sortDirection: 'asc' })
        }
      },

      setSort: (field, direction) => {
        set({ sortField: field as SortField, sortDirection: direction })
      },

      clearSort: () => set({ sortField: null, sortDirection: null }),
    }),
    { name: 'table-sort-store' }
  )
)

// 後方互換性のためのエイリアス
export const useInboxSortStore = useTableSortStore

// 型の再エクスポート
export type { SortDirection, SortField }
