import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * 列ID
 */
export type ColumnId =
  | 'selection'
  | 'id'
  | 'title'
  | 'status'
  | 'tags'
  | 'due_date'
  | 'duration'
  | 'created_at'
  | 'updated_at'

/**
 * 列設定
 */
export interface ColumnConfig {
  id: ColumnId
  label: string
  visible: boolean
  width: number
  resizable: boolean
}

/**
 * デフォルト列設定
 */
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'selection', label: '', visible: true, width: 50, resizable: false },
  { id: 'id', label: 'ID', visible: false, width: 100, resizable: true },
  { id: 'title', label: 'タイトル', visible: true, width: 300, resizable: true },
  { id: 'status', label: 'ステータス', visible: true, width: 120, resizable: true },
  { id: 'tags', label: 'タグ', visible: true, width: 200, resizable: true },
  { id: 'due_date', label: '期限', visible: true, width: 120, resizable: true },
  { id: 'duration', label: '期間', visible: true, width: 200, resizable: true },
  { id: 'created_at', label: '作成日', visible: true, width: 120, resizable: true },
  { id: 'updated_at', label: '更新日', visible: false, width: 120, resizable: true },
]

/**
 * Inbox列設定状態
 */
interface InboxColumnState {
  columns: ColumnConfig[]
  setColumnWidth: (id: ColumnId, width: number) => void
  toggleColumnVisibility: (id: ColumnId) => void
  resetColumns: () => void
  getVisibleColumns: () => ColumnConfig[]
}

/**
 * Inbox列設定ストア
 *
 * テーブルの列幅と表示/非表示を管理
 * - localStorageに永続化
 * - 列幅の調整（最小50px）
 * - 列の表示/非表示切り替え
 *
 * @example
 * ```tsx
 * const { columns, setColumnWidth, toggleColumnVisibility } = useInboxColumnStore()
 *
 * // 列幅を変更
 * setColumnWidth('title', 400)
 *
 * // 列の表示/非表示を切り替え
 * toggleColumnVisibility('tags')
 * ```
 */
export const useInboxColumnStore = create<InboxColumnState>()(
  devtools(
    persist(
      (set, get) => ({
        columns: DEFAULT_COLUMNS,

        setColumnWidth: (id, width) => {
          // 最小幅50pxを保証
          const newWidth = Math.max(50, width)

          set({
            columns: get().columns.map((col) => (col.id === id ? { ...col, width: newWidth } : col)),
          })
        },

        toggleColumnVisibility: (id) => {
          // selection は常に表示
          if (id === 'selection') return

          set({
            columns: get().columns.map((col) => (col.id === id ? { ...col, visible: !col.visible } : col)),
          })
        },

        resetColumns: () => set({ columns: DEFAULT_COLUMNS }),

        getVisibleColumns: () => get().columns.filter((col) => col.visible),
      }),
      {
        name: 'inbox-column-store-v8',
      }
    ),
    { name: 'inbox-column-store-v8' }
  )
)
