/**
 * Table Feature
 *
 * 汎用テーブル機能を提供するfeature
 * - Store: 列設定、ソート、グループ化、ページネーション、選択、フォーカス
 * - Types: 列、ソート、グループの型定義
 *
 * @example
 * ```tsx
 * import { useTableColumnStore, useTableSortStore, type SortField } from '@/features/table'
 *
 * function MyTable() {
 *   const { columns } = useTableColumnStore()
 *   const { sortField, setSortField } = useTableSortStore()
 *   // ...
 * }
 * ```
 */

// Stores
export {
  useTableColumnStore,
  useTableFocusStore,
  useTableGroupStore,
  useTablePaginationStore,
  useTableSelectionStore,
  useTableSortStore,
  // 後方互換性のためのエイリアス
  useInboxColumnStore,
  useInboxFocusStore,
  useInboxGroupStore,
  useInboxPaginationStore,
  useInboxSelectionStore,
  useInboxSortStore,
} from './stores'

// Types
export type { ColumnConfig, ColumnId } from './types/column'
export type { GroupByField, GroupConfig, GroupedData } from './types/group'
export type { SortDirection, SortField } from './types/sort'
