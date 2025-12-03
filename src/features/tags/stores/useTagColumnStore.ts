import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * タグテーブル列ID
 */
export type TagColumnId = 'selection' | 'id' | 'name' | 'description' | 'group' | 'created_at' | 'last_used'

/**
 * 列設定
 */
export interface TagColumnConfig {
  id: TagColumnId
  label: string
  visible: boolean
  width: number
  resizable: boolean
}

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
]

/**
 * タグ列設定状態
 */
interface TagColumnState {
  columns: TagColumnConfig[]
  setColumnWidth: (id: TagColumnId, width: number) => void
  toggleColumnVisibility: (id: TagColumnId) => void
  setColumnVisibility: (id: TagColumnId, visible: boolean) => void
  resetColumns: () => void
  getVisibleColumns: () => TagColumnConfig[]
  getColumnWidth: (id: TagColumnId) => number
}

/**
 * タグ列設定ストア
 *
 * テーブルの列幅と表示/非表示を管理
 * - localStorageに永続化
 * - 列幅の調整（最小50px）
 * - 列の表示/非表示切り替え
 */
export const useTagColumnStore = create<TagColumnState>()(
  devtools(
    persist(
      (set, get) => ({
        columns: DEFAULT_COLUMNS,

        setColumnWidth: (id, width) => {
          const newWidth = Math.max(50, width)
          set({
            columns: get().columns.map((col) => (col.id === id ? { ...col, width: newWidth } : col)),
          })
        },

        toggleColumnVisibility: (id) => {
          // selection と name は常に表示
          if (id === 'selection' || id === 'name') return
          set({
            columns: get().columns.map((col) => (col.id === id ? { ...col, visible: !col.visible } : col)),
          })
        },

        setColumnVisibility: (id, visible) => {
          // selection と name は常に表示
          if (id === 'selection' || id === 'name') return
          set({
            columns: get().columns.map((col) => (col.id === id ? { ...col, visible } : col)),
          })
        },

        resetColumns: () => set({ columns: DEFAULT_COLUMNS }),

        getVisibleColumns: () => get().columns.filter((col) => col.visible),

        getColumnWidth: (id) => {
          const col = get().columns.find((c) => c.id === id)
          return col?.width ?? 100
        },
      }),
      {
        name: 'tag-column-store-v1',
      }
    ),
    { name: 'tag-column-store' }
  )
)
