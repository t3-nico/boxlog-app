import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * タグソート対象フィールド
 */
export type TagSortField = 'tag_number' | 'name' | 'group' | 'created_at' | 'last_used'

/**
 * ソート方向
 */
export type SortDirection = 'asc' | 'desc'

/**
 * タグソート状態
 */
interface TagSortState {
  sortField: TagSortField
  sortDirection: SortDirection
  setSortField: (field: TagSortField) => void
  setSort: (field: TagSortField, direction: SortDirection) => void
}

/**
 * タグソートストア
 *
 * テーブルヘッダークリックでソート状態を管理
 * asc → desc の順で切り替わる
 */
export const useTagSortStore = create<TagSortState>()(
  devtools(
    persist(
      (set, get) => ({
        sortField: 'created_at',
        sortDirection: 'desc',

        setSortField: (field) => {
          const { sortField, sortDirection } = get()

          if (sortField === field) {
            // 同じフィールド: asc ↔ desc
            set({
              sortDirection: sortDirection === 'asc' ? 'desc' : 'asc',
            })
          } else {
            // 別フィールド: asc から開始
            set({ sortField: field, sortDirection: 'asc' })
          }
        },

        setSort: (field, direction) => {
          set({ sortField: field, sortDirection: direction })
        },
      }),
      {
        name: 'tag-sort-store-v1',
      }
    ),
    { name: 'tag-sort-store' }
  )
)
