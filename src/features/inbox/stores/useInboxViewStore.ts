import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CreateInboxViewInput, DisplayMode, InboxView, UpdateInboxViewInput } from '../types/view'

/**
 * Inbox View Store State
 */
type InboxViewState = {
  /** 保存されているView一覧 */
  views: InboxView[]

  /** 現在アクティブなView ID */
  activeViewId: string | null

  /** 現在の表示形式（Board/Table） */
  displayMode: DisplayMode

  /** View作成 */
  createView: (input: CreateInboxViewInput) => InboxView

  /** View更新 */
  updateView: (id: string, input: UpdateInboxViewInput) => void

  /** View削除 */
  deleteView: (id: string) => void

  /** アクティブなViewを設定 */
  setActiveView: (id: string) => void

  /** 表示形式を設定 */
  setDisplayMode: (mode: DisplayMode) => void

  /** View IDから取得 */
  getViewById: (id: string) => InboxView | undefined

  /** アクティブなViewを取得 */
  getActiveView: () => InboxView | undefined

  /** デフォルトViewを設定 */
  setDefaultView: (id: string) => void
}

/**
 * デフォルトView（初期データ）
 */
const DEFAULT_VIEWS: InboxView[] = [
  {
    id: 'default-all',
    name: 'すべてのplan',
    filters: {},
    sorting: {
      field: 'created_at',
      direction: 'desc',
    },
    pageSize: 20,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-archive',
    name: 'アーカイブ',
    filters: {
      archived: true,
    },
    sorting: {
      field: 'created_at',
      direction: 'desc',
    },
    pageSize: 20,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

/**
 * Inbox View Store
 *
 * ユーザーがカスタマイズ可能なView（表示設定）を管理するstore
 *
 * @example
 * ```typescript
 * const { views, createView, setActiveView, displayMode, setDisplayMode } = useInboxViewStore()
 *
 * // View作成
 * const newView = createView({
 *   name: '高優先度',
 *   filters: { priority: ['high', 'urgent'] }
 * })
 *
 * // View切り替え
 * setActiveView(newView.id)
 *
 * // 表示形式切り替え
 * setDisplayMode('table')
 * ```
 */
export const useInboxViewStore = create<InboxViewState>()(
  persist(
    (set, get) => ({
      views: DEFAULT_VIEWS,
      activeViewId: 'default-all',
      displayMode: 'table',

      createView: (input) => {
        const newView: InboxView = {
          id: `view-${Date.now()}`,
          name: input.name,
          filters: input.filters || {},
          sorting: input.sorting,
          isDefault: input.isDefault || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          views: [...state.views, newView],
        }))

        return newView
      },

      updateView: (id, input) => {
        set((state) => ({
          views: state.views.map((view) =>
            view.id === id
              ? {
                  ...view,
                  ...input,
                  updatedAt: new Date(),
                }
              : view
          ),
        }))
      },

      deleteView: (id) => {
        const { views, activeViewId } = get()

        // デフォルトViewは削除不可
        const viewToDelete = views.find((v) => v.id === id)
        if (viewToDelete?.id.startsWith('default-')) {
          console.warn('Cannot delete default view')
          return
        }

        // アクティブなViewを削除する場合は、デフォルトViewに切り替え
        if (activeViewId === id) {
          set({ activeViewId: 'default-all' })
        }

        set((state) => ({
          views: state.views.filter((view) => view.id !== id),
        }))
      },

      setActiveView: (id) => {
        set({ activeViewId: id })
      },

      setDisplayMode: (mode) => {
        set({ displayMode: mode })
      },

      getViewById: (id) => {
        return get().views.find((view) => view.id === id)
      },

      getActiveView: () => {
        const { views, activeViewId } = get()
        return views.find((view) => view.id === activeViewId)
      },

      setDefaultView: (id) => {
        set((state) => ({
          views: state.views.map((view) => ({
            ...view,
            isDefault: view.id === id,
          })),
        }))
      },
    }),
    {
      name: 'inbox-view-storage-v2',
    }
  )
)
