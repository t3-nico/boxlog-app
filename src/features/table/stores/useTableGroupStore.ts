import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { GroupByField } from '../types/group'

/**
 * テーブルグループ化状態
 */
interface TableGroupState {
  /** グループ化フィールド（nullの場合はグループ化なし） */
  groupBy: GroupByField
  /** 折りたたまれたグループのSet */
  collapsedGroups: Set<string>
  /** グループ化フィールドを設定 */
  setGroupBy: (field: GroupByField) => void
  /** グループの折りたたみ状態をトグル */
  toggleGroupCollapse: (groupKey: string) => void
  /** すべてのグループを展開 */
  expandAll: () => void
  /** すべてのグループを折りたたむ */
  collapseAll: (groupKeys: string[]) => void
  /** リセット */
  reset: () => void
}

/**
 * テーブルグループ化ストア
 *
 * テーブルビューのグループ化状態を管理
 * - groupBy: グループ化するフィールド
 * - collapsedGroups: 折りたたまれたグループのSet
 *
 * @example
 * ```tsx
 * const { groupBy, setGroupBy, toggleGroupCollapse } = useTableGroupStore()
 *
 * // ステータスでグループ化
 * setGroupBy('status')
 *
 * // グループを折りたたむ/展開
 * toggleGroupCollapse('active')
 * ```
 */
export const useTableGroupStore = create<TableGroupState>()(
  devtools(
    (set, get) => ({
      groupBy: null,
      collapsedGroups: new Set(),

      setGroupBy: (field) => {
        set({ groupBy: field, collapsedGroups: new Set() })
      },

      toggleGroupCollapse: (groupKey) => {
        const { collapsedGroups } = get()
        const newCollapsed = new Set(collapsedGroups)

        if (newCollapsed.has(groupKey)) {
          newCollapsed.delete(groupKey)
        } else {
          newCollapsed.add(groupKey)
        }

        set({ collapsedGroups: newCollapsed })
      },

      expandAll: () => {
        set({ collapsedGroups: new Set() })
      },

      collapseAll: (groupKeys) => {
        set({ collapsedGroups: new Set(groupKeys) })
      },

      reset: () => {
        set({ groupBy: null, collapsedGroups: new Set() })
      },
    }),
    { name: 'table-group-store' }
  )
)

// 後方互換性のためのエイリアス
export const useInboxGroupStore = useTableGroupStore
