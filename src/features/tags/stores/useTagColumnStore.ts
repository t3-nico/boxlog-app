import { createTableColumnStore, type ColumnConfig } from '@/features/table';

/**
 * タグテーブル列ID
 */
export type TagColumnId =
  | 'selection'
  | 'id'
  | 'name'
  | 'description'
  | 'group'
  | 'created_at'
  | 'last_used';

/**
 * タグ列設定
 */
export type TagColumnConfig = ColumnConfig<TagColumnId>;

/**
 * デフォルト列設定
 */
const DEFAULT_COLUMNS: TagColumnConfig[] = [
  { id: 'selection', label: '', visible: true, width: 48, resizable: false },
  { id: 'id', label: 'ID', visible: true, width: 80, resizable: true },
  { id: 'name', label: 'タグ名', visible: true, width: 232, resizable: true },
  { id: 'description', label: '説明', visible: true, width: 300, resizable: true },
  { id: 'group', label: 'グループ', visible: true, width: 120, resizable: true },
  { id: 'created_at', label: '作成日', visible: true, width: 160, resizable: true },
  { id: 'last_used', label: '最終使用', visible: true, width: 160, resizable: true },
];

/**
 * タグ列設定ストア
 *
 * features/table の createTableColumnStore を使用
 * - selection と name は常に表示（alwaysVisibleColumns）
 * - localStorageに永続化
 */
export const useTagColumnStore = createTableColumnStore<TagColumnId>({
  defaultColumns: DEFAULT_COLUMNS,
  persistKey: 'tag-column-store-v1',
  storeName: 'tag-column-store',
  alwaysVisibleColumns: ['selection', 'name'],
});
