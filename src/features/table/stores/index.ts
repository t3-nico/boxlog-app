// Factory functions
export {
  createTableColumnStore,
  type ColumnConfig,
  type CreateTableColumnStoreConfig,
  type TableColumnState,
} from './createTableColumnStore'
export { createTableFocusStore, type CreateTableFocusStoreConfig, type TableFocusState } from './createTableFocusStore'
export {
  createTablePaginationStore,
  type CreateTablePaginationStoreConfig,
  type TablePaginationState,
} from './createTablePaginationStore'
export {
  createTableSelectionStore,
  type CreateTableSelectionStoreConfig,
  type TableSelectionState,
} from './createTableSelectionStore'
export {
  createTableSortStore,
  type CreateTableSortStoreConfig,
  type SortDirection,
  type SortDirectionNullable,
  type TableSortState,
  type TableSortStateNullable,
} from './createTableSortStore'

// Concrete stores (後方互換性のため維持)
export { useInboxColumnStore, useTableColumnStore } from './useTableColumnStore'
export { useInboxFocusStore, useTableFocusStore } from './useTableFocusStore'
export { useInboxGroupStore, useTableGroupStore } from './useTableGroupStore'
export { useInboxPaginationStore, useTablePaginationStore } from './useTablePaginationStore'
export { useInboxSelectionStore, useTableSelectionStore } from './useTableSelectionStore'
export { useInboxSortStore, useTableSortStore, type SortField } from './useTableSortStore'
