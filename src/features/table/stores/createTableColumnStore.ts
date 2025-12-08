import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * 汎用列設定
 */
export interface ColumnConfig<TColumnId extends string> {
  id: TColumnId
  label: string
  visible: boolean
  width: number
  resizable: boolean
}

/**
 * 列設定ストアの状態
 */
export interface TableColumnState<TColumnId extends string> {
  columns: ColumnConfig<TColumnId>[]
  setColumnWidth: (id: TColumnId, width: number) => void
  toggleColumnVisibility: (id: TColumnId) => void
  setColumnVisibility: (id: TColumnId, visible: boolean) => void
  resetColumns: () => void
  getVisibleColumns: () => ColumnConfig<TColumnId>[]
  getColumnWidth: (id: TColumnId) => number
}

/**
 * 列設定ストアのファクトリー設定
 */
export interface CreateTableColumnStoreConfig<TColumnId extends string> {
  /** デフォルト列設定 */
  defaultColumns: ColumnConfig<TColumnId>[]
  /** localStorage 永続化キー */
  persistKey: string
  /** devtools 表示名 */
  storeName?: string
  /** 常に表示する列（非表示にできない） */
  alwaysVisibleColumns?: TColumnId[]
  /** 最小列幅（デフォルト: 50） */
  minWidth?: number
}

/**
 * テーブル列設定ストアのファクトリー関数
 *
 * @example
 * ```typescript
 * // Inbox用
 * export const useInboxColumnStore = createTableColumnStore({
 *   defaultColumns: [
 *     { id: 'selection', label: '', visible: true, width: 50, resizable: false },
 *     { id: 'title', label: 'タイトル', visible: true, width: 300, resizable: true },
 *   ],
 *   persistKey: 'inbox-column-store-v9',
 *   alwaysVisibleColumns: ['selection'],
 * })
 *
 * // Tags用
 * export const useTagColumnStore = createTableColumnStore({
 *   defaultColumns: [
 *     { id: 'selection', label: '', visible: true, width: 48, resizable: false },
 *     { id: 'name', label: 'タグ名', visible: true, width: 232, resizable: true },
 *   ],
 *   persistKey: 'tag-column-store-v1',
 *   alwaysVisibleColumns: ['selection', 'name'],
 * })
 * ```
 */
export function createTableColumnStore<TColumnId extends string>(config: CreateTableColumnStoreConfig<TColumnId>) {
  const { defaultColumns, persistKey, storeName = persistKey, alwaysVisibleColumns = [], minWidth = 50 } = config

  return create<TableColumnState<TColumnId>>()(
    devtools(
      persist(
        (set, get) => ({
          columns: defaultColumns,

          setColumnWidth: (id, width) => {
            const newWidth = Math.max(minWidth, width)
            set({
              columns: get().columns.map((col) => (col.id === id ? { ...col, width: newWidth } : col)),
            })
          },

          toggleColumnVisibility: (id) => {
            // 常に表示する列は切り替え不可
            if (alwaysVisibleColumns.includes(id)) return
            set({
              columns: get().columns.map((col) => (col.id === id ? { ...col, visible: !col.visible } : col)),
            })
          },

          setColumnVisibility: (id, visible) => {
            // 常に表示する列は切り替え不可
            if (alwaysVisibleColumns.includes(id)) return
            set({
              columns: get().columns.map((col) => (col.id === id ? { ...col, visible } : col)),
            })
          },

          resetColumns: () => set({ columns: defaultColumns }),

          getVisibleColumns: () => get().columns.filter((col) => col.visible),

          getColumnWidth: (id) => {
            const col = get().columns.find((c) => c.id === id)
            return col?.width ?? 100
          },
        }),
        { name: persistKey }
      ),
      { name: storeName }
    )
  )
}
