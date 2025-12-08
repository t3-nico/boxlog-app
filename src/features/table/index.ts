/**
 * Table Feature
 *
 * 汎用テーブル機能を提供するfeature
 * inbox/tags 等で共通して使用する「基本デスク」
 *
 * ## アーキテクチャ
 *
 * - **コンポーネント**: components/common/table + 独自コンポーネント
 * - **状態管理**: Zustand store factories + 具象 stores
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

// ============================================
// 共通テーブルコンポーネント (components/common/table より)
// ============================================
export {
  // DataTable - 汎用テーブル
  DataTable,
  type ColumnDef,
  type DataTableProps,
  type GroupedData as DataTableGroupedData,
  type PaginationState,
  type SortState,
  // TablePagination - ページネーション（i18n対応）
  TablePagination,
  // ResizableTableHead - リサイズ・ソート対応ヘッダー
  ResizableTableHead,
} from '@/components/common/table'

// ============================================
// features/table 独自コンポーネント
// ============================================
export {
  // Selection - 選択チェックボックス
  SelectionCell,
  SelectionHeader,
  // Header - 型安全なソート・リサイズヘッダー
  SortableHeader,
  // Empty state - 空状態表示
  TableEmptyState,
} from './components'

export type {
  SelectionCellProps,
  SelectionHeaderProps,
  SortableHeaderProps,
  TableEmptyStateProps,
} from './components'

// ============================================
// Store Factories
// ============================================
export {
  createTableColumnStore,
  createTableFocusStore,
  createTablePaginationStore,
  createTableSelectionStore,
  createTableSortStore,
} from './stores'

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

// ============================================
// Concrete Stores (後方互換性のため維持)
// ============================================
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

// ============================================
// Legacy Types (後方互換性のため維持)
// ============================================
export type { ColumnId } from './types/column'
export type { GroupByField, GroupConfig, GroupedData } from './types/group'
export type { SortField } from './types/sort'
