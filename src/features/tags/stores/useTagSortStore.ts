import { createTableSortStore, type SortDirection } from '@/features/table'

/**
 * タグソート対象フィールド
 */
export type TagSortField = 'tag_number' | 'name' | 'group' | 'created_at' | 'last_used'

// Re-export SortDirection for backward compatibility
export type { SortDirection }

/**
 * タグソートストア
 *
 * features/table の createTableSortStore を使用
 * - asc ↔ desc で切り替え（ソート解除なし）
 * - localStorageに永続化
 */
export const useTagSortStore = createTableSortStore<TagSortField>({
  defaultSortField: 'created_at',
  defaultSortDirection: 'desc',
  persistKey: 'tag-sort-store-v1',
  storeName: 'tag-sort-store',
  allowClearSort: false,
})
