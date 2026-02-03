import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { ColumnConfig, ColumnId, TableType } from '../types/column';

/**
 * Plan テーブルのデフォルト列設定
 */
const DEFAULT_PLAN_COLUMNS: ColumnConfig[] = [
  { id: 'selection', label: '', visible: true, width: 50, resizable: false },
  { id: 'title', label: 'タイトル', visible: true, width: 300, resizable: true },
  { id: 'tags', label: 'タグ', visible: true, width: 200, resizable: true },
  { id: 'duration', label: '期間', visible: true, width: 200, resizable: true },
  { id: 'records', label: 'Records', visible: true, width: 120, resizable: true },
  { id: 'created_at', label: '作成日', visible: true, width: 120, resizable: true },
  { id: 'updated_at', label: '更新日', visible: false, width: 120, resizable: true },
];

/**
 * Record テーブルのデフォルト列設定
 */
const DEFAULT_RECORD_COLUMNS: ColumnConfig[] = [
  { id: 'selection', label: '', visible: true, width: 50, resizable: false },
  { id: 'title', label: 'タイトル', visible: true, width: 250, resizable: true },
  { id: 'plan', label: 'Plan', visible: true, width: 150, resizable: true },
  { id: 'tags', label: 'タグ', visible: true, width: 150, resizable: true },
  { id: 'worked_at', label: '作業日', visible: true, width: 110, resizable: true },
  { id: 'duration_minutes', label: '時間', visible: true, width: 90, resizable: true },
  { id: 'fulfillment_score', label: '充実度', visible: true, width: 120, resizable: true },
  { id: 'created_at', label: '作成日', visible: true, width: 110, resizable: true },
  { id: 'updated_at', label: '更新日', visible: true, width: 110, resizable: true },
];

/**
 * テーブルタイプ別のデフォルト列設定を取得
 */
function getDefaultColumns(tableType: TableType): ColumnConfig[] {
  return tableType === 'record' ? DEFAULT_RECORD_COLUMNS : DEFAULT_PLAN_COLUMNS;
}

/**
 * テーブル列設定状態
 */
interface TableColumnState {
  tableType: TableType;
  planColumns: ColumnConfig[];
  recordColumns: ColumnConfig[];
  /** 現在のテーブルタイプの列を取得（後方互換性） */
  columns: ColumnConfig[];
  setTableType: (tableType: TableType) => void;
  setColumnWidth: (id: ColumnId, width: number) => void;
  toggleColumnVisibility: (id: ColumnId) => void;
  resetColumns: () => void;
  getVisibleColumns: () => ColumnConfig[];
}

/**
 * テーブル列設定ストア
 *
 * テーブルの列幅と表示/非表示を管理
 * - Plan と Record それぞれ独立した列設定を持つ
 * - localStorageに永続化
 * - 列幅の調整（最小50px）
 * - 列の表示/非表示切り替え
 *
 * @example
 * ```tsx
 * const { columns, setTableType, setColumnWidth } = useTableColumnStore()
 *
 * // Record テーブルに切り替え
 * useEffect(() => { setTableType('record') }, [])
 *
 * // 列幅を変更
 * setColumnWidth('title', 400)
 * ```
 */
export const useTableColumnStore = create<TableColumnState>()(
  devtools(
    persist(
      (set, get) => ({
        tableType: 'plan' as TableType,
        planColumns: DEFAULT_PLAN_COLUMNS,
        recordColumns: DEFAULT_RECORD_COLUMNS,

        // 現在のテーブルタイプの列を取得（getter として機能）
        get columns() {
          const state = get();
          return state.tableType === 'record' ? state.recordColumns : state.planColumns;
        },

        setTableType: (tableType) => set({ tableType }),

        setColumnWidth: (id, width) => {
          const newWidth = Math.max(50, width);
          const state = get();
          const columnsKey = state.tableType === 'record' ? 'recordColumns' : 'planColumns';

          set({
            [columnsKey]: state[columnsKey].map((col) =>
              col.id === id ? { ...col, width: newWidth } : col,
            ),
          });
        },

        toggleColumnVisibility: (id) => {
          if (id === 'selection') return;
          const state = get();
          const columnsKey = state.tableType === 'record' ? 'recordColumns' : 'planColumns';

          set({
            [columnsKey]: state[columnsKey].map((col) =>
              col.id === id ? { ...col, visible: !col.visible } : col,
            ),
          });
        },

        resetColumns: () => {
          const state = get();
          const columnsKey = state.tableType === 'record' ? 'recordColumns' : 'planColumns';
          set({ [columnsKey]: getDefaultColumns(state.tableType) });
        },

        getVisibleColumns: () => {
          const state = get();
          const columns = state.tableType === 'record' ? state.recordColumns : state.planColumns;
          return columns.filter((col) => col.visible);
        },
      }),
      {
        // Record列対応に伴いv12に更新
        name: 'inbox-column-store-v12',
      },
    ),
    { name: 'table-column-store' },
  ),
);

// 後方互換性のためのエイリアス
export const useInboxColumnStore = useTableColumnStore;
