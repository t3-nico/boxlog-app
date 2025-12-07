/**
 * Table Feature
 *
 * 汎用テーブル機能を提供するfeature
 *
 * ## Factory パターン（推奨）
 *
 * 各ドメインで独自のテーブル store を作成する場合：
 *
 * @example
 * ```tsx
 * import { createTableColumnStore, createTableSortStore } from '@/features/table'
 *
 * // Inbox用の列定義
 * type InboxColumnId = 'selection' | 'title' | 'status' | 'tags'
 *
 * export const useInboxColumnStore = createTableColumnStore<InboxColumnId>({
 *   defaultColumns: [
 *     { id: 'selection', label: '', visible: true, width: 50, resizable: false },
 *     { id: 'title', label: 'タイトル', visible: true, width: 300, resizable: true },
 *   ],
 *   persistKey: 'inbox-column-store-v9',
 *   alwaysVisibleColumns: ['selection'],
 * })
 * ```
 *
 * ## 具象 Store（後方互換性）
 *
 * デフォルトの Inbox 用 store を直接使用する場合：
 *
 * @example
 * ```tsx
 * import { useTableColumnStore } from '@/features/table'
 *
 * function MyTable() {
 *   const { columns } = useTableColumnStore()
 * }
 * ```
 */

// Factory functions
export {
  createTableColumnStore,
  createTableFocusStore,
  createTablePaginationStore,
  createTableSelectionStore,
  createTableSortStore,
} from './stores'

// Factory types
export type {
  ColumnConfig,
  CreateTableColumnStoreConfig,
  CreateTableFocusStoreConfig,
  CreateTablePaginationStoreConfig,
  CreateTableSelectionStoreConfig,
  CreateTableSortStoreConfig,
  SortDirection,
  SortDirectionNullable,
  TableColumnState,
  TableFocusState,
  TablePaginationState,
  TableSelectionState,
  TableSortState,
  TableSortStateNullable,
} from './stores'

// Concrete stores (後方互換性のため維持)
export {
  useTableColumnStore,
  useTableFocusStore,
  useTableGroupStore,
  useTablePaginationStore,
  useTableSelectionStore,
  useTableSortStore,
  // エイリアス
  useInboxColumnStore,
  useInboxFocusStore,
  useInboxGroupStore,
  useInboxPaginationStore,
  useInboxSelectionStore,
  useInboxSortStore,
} from './stores'

// Legacy types (後方互換性のため維持)
export type { ColumnId } from './types/column'
export type { GroupByField, GroupConfig, GroupedData } from './types/group'
export type { SortField } from './types/sort'
