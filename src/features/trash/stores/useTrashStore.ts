import { create } from 'zustand'

import { getTranslation } from '@/features/calendar/lib/toast/get-translation'

import {
  RestoreResult,
  TRASH_RETENTION_DAYS,
  TrashFilters,
  TrashItem,
  TrashItemType,
  TrashSort,
  TrashStats,
  TrashStore,
  isTrashItem,
} from '../types/trash'

// LocalStorage キー
const STORAGE_KEY = 'boxlog-trash'

// ブラウザ環境判定
const isBrowser = typeof window !== 'undefined'

// LocalStorage用の型定義（Date型が文字列になっている）
interface TrashItemForStorage {
  id: string
  originalId: string
  type: TrashItemType
  data: unknown
  deletedAt: string // Date型が文字列になっている
  deletedBy: string
  title: string
  description?: string
}

/**
 * LocalStorage への保存
 */
const saveToLocalStorage = (items: TrashItem[]) => {
  if (!isBrowser) return

  try {
    const serializedItems = items.map((item) => ({
      ...item,
      deletedAt: item.deletedAt.toISOString(),
      selectedIds: undefined, // Setは保存しない
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedItems))
  } catch (error) {
    console.error('💾 Failed to save trash to localStorage:', error)
  }
}

/**
 * LocalStorage からの読み込み
 */
const loadFromLocalStorage = (): TrashItem[] => {
  if (!isBrowser) return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return parsed
      .map((item: TrashItemForStorage) => ({
        ...item,
        deletedAt: new Date(item.deletedAt),
      }))
      .filter(isTrashItem)
  } catch (error) {
    console.error('📖 Failed to load trash from localStorage:', error)
    return []
  }
}

/**
 * デフォルトフィルター（シンプル版）
 */
const defaultFilters: TrashFilters = {
  types: [],
  searchQuery: '',
  dateRange: { from: null, to: null },
}

/**
 * デフォルトソート
 */
const defaultSort: TrashSort = {
  by: 'deletedAt',
  order: 'desc',
}

/**
 * 統一ゴミ箱ストア
 */
export const useTrashStore = create<TrashStore>()((set, get) => ({
  // 初期状態
  items: loadFromLocalStorage(),
  selectedIds: new Set(),
  filters: defaultFilters,
  sort: defaultSort,
  loading: false,
  error: null,
  lastFetched: null,

  // アイテム追加
  addItem: async (itemData: Omit<TrashItem, 'deletedAt'>) => {
    const newItem: TrashItem = {
      ...itemData,
      deletedAt: new Date(),
    }

    set((state) => {
      const updatedItems = [newItem, ...state.items]
      saveToLocalStorage(updatedItems)
      return {
        items: updatedItems,
        error: null,
      }
    })
  },

  // 複数アイテム追加
  addItems: async (itemsData: Omit<TrashItem, 'deletedAt'>[]) => {
    const now = new Date()
    const newItems: TrashItem[] = itemsData.map((itemData) => ({
      ...itemData,
      deletedAt: now,
    }))

    set((state) => {
      const updatedItems = [...newItems, ...state.items]
      saveToLocalStorage(updatedItems)
      return {
        items: updatedItems,
        error: null,
      }
    })
  },

  // アイテム削除（内部使用）
  removeItem: (id: string) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id)
      saveToLocalStorage(updatedItems)
      return {
        items: updatedItems,
        selectedIds: new Set(Array.from(state.selectedIds).filter((selectedId) => selectedId !== id)),
      }
    })
  },

  // 複数アイテム削除（内部使用）
  removeItems: (ids: string[]) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => !ids.includes(item.id))
      const updatedSelectedIds = new Set(
        Array.from(state.selectedIds).filter((selectedId) => !ids.includes(selectedId))
      )
      saveToLocalStorage(updatedItems)
      return {
        items: updatedItems,
        selectedIds: updatedSelectedIds,
      }
    })
  },

  // アイテム復元
  restoreItem: async (id: string) => {
    const { items } = get()
    const item = items.find((item) => item.id === id)

    if (!item) {
      throw new Error(`アイテム ID:${id} が見つかりません`)
    }

    try {
      await restoreItemByType(item)
      get().removeItem(id)
      console.log('✅ Item restored:', item.title, `(${item.type})`)
    } catch (error) {
      console.error('❌ Failed to restore item:', error)
      set({ error: error instanceof Error ? error.message : getTranslation('trash.errors.restoreFailed') })
      throw error
    }
  },

  // 複数アイテム復元
  restoreItems: async (ids: string[]) => {
    const { items } = get()
    const itemsToRestore = items.filter((item) => ids.includes(item.id))

    if (itemsToRestore.length === 0) {
      return
    }

    set({ loading: true })

    const result: RestoreResult = {
      success: 0,
      failed: 0,
      errors: [],
      restoredIds: [],
    }

    for (const item of itemsToRestore) {
      try {
        await restoreItemByType(item)
        result.success++
        result.restoredIds.push(item.id)
        console.log('✅ Item restored:', item.title, `(${item.type})`)
      } catch (error) {
        result.failed++
        result.errors.push(`${item.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.error('❌ Failed to restore item:', item.title, error)
      }
    }

    // 成功したアイテムをゴミ箱から削除
    if (result.restoredIds.length > 0) {
      get().removeItems(result.restoredIds)
    }

    set({
      loading: false,
      error: result.failed > 0 ? `${result.failed}件の復元に失敗しました` : null,
    })

    return result
  },

  // 完全削除（単一）
  permanentlyDelete: async (id: string) => {
    const { items } = get()
    const item = items.find((item) => item.id === id)

    if (!item) return

    if (!confirm(`「${item.title}」を完全に削除しますか？この操作は元に戻せません。`)) {
      return
    }

    get().removeItem(id)
    console.log('🗑️ Item permanently deleted:', item.title, `(${item.type})`)
  },

  // 完全削除（複数）
  permanentlyDeleteItems: async (ids: string[]) => {
    const { items } = get()
    const itemsToDelete = items.filter((item) => ids.includes(item.id))

    if (itemsToDelete.length === 0) return

    if (!confirm(`${itemsToDelete.length}件のアイテムを完全に削除しますか？この操作は元に戻せません。`)) {
      return
    }

    get().removeItems(ids)
    console.log('🗑️ Items permanently deleted:', itemsToDelete.length, 'items')
  },

  // ゴミ箱を空にする
  emptyTrash: async () => {
    const { items } = get()

    if (items.length === 0) return

    if (!confirm(`ゴミ箱内の${items.length}件のアイテムをすべて削除しますか？この操作は元に戻せません。`)) {
      return
    }

    set({
      items: [],
      selectedIds: new Set(),
      error: null,
    })

    saveToLocalStorage([])
    console.log('🗑️ Trash emptied:', items.length, 'items deleted')
  },

  // 期限切れアイテムの削除
  clearExpiredItems: async () => {
    const expiredItems = get().getExpiredItems()

    if (expiredItems.length === 0) return

    const expiredIds = expiredItems.map((item) => item.id)
    get().removeItems(expiredIds)

    console.log('🗑️ Expired items cleared:', expiredItems.length, 'items')
  },

  // 選択操作
  selectItem: (id: string) => {
    set((state) => ({
      selectedIds: new Set([...Array.from(state.selectedIds), id]),
    }))
  },

  selectItems: (ids: string[]) => {
    set((state) => ({
      selectedIds: new Set([...Array.from(state.selectedIds), ...ids]),
    }))
  },

  deselectItem: (id: string) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds)
      newSelected.delete(id)
      return { selectedIds: newSelected }
    })
  },

  deselectItems: (ids: string[]) => {
    set((state) => {
      const newSelected = new Set(Array.from(state.selectedIds).filter((selectedId) => !ids.includes(selectedId)))
      return { selectedIds: newSelected }
    })
  },

  selectAll: () => {
    const filteredItems = get().getFilteredItems()
    const allIds = filteredItems.map((item) => item.id)
    set({ selectedIds: new Set(allIds) })
  },

  deselectAll: () => {
    set({ selectedIds: new Set() })
  },

  // フィルター・ソート
  setFilters: (newFilters: Partial<TrashFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
  },

  setSort: (newSort: Partial<TrashSort>) => {
    set((state) => ({
      sort: { ...state.sort, ...newSort },
    }))
  },

  // データ取得
  fetchItems: async () => {
    set({ loading: true })

    try {
      const items = loadFromLocalStorage()
      set({
        items,
        loading: false,
        error: null,
        lastFetched: new Date(),
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : getTranslation('trash.errors.fetchFailed'),
      })
    }
  },

  // フィルター適用後のアイテム取得（シンプル版）
  getFilteredItems: () => {
    const { items, filters, sort: _sort } = get()
    let filtered = [...items]

    // 検索フィルター
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.metadata?.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // ソート（削除日時の新しい順）
    filtered.sort((a, b) => {
      return b.deletedAt.getTime() - a.deletedAt.getTime()
    })

    return filtered
  },

  // 期限切れアイテム取得
  getExpiredItems: (days: number = TRASH_RETENTION_DAYS) => {
    const { items } = get()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return items.filter((item) => item.deletedAt < cutoffDate)
  },

  // タイプ別アイテム取得
  getItemsByType: (type: TrashItemType) => {
    const { items } = get()
    return items.filter((item) => item.type === type)
  },

  // 統計情報取得
  getStats: () => {
    const { items } = get()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats: TrashStats = {
      totalItems: items.length,
      itemsByType: {} as Record<TrashItemType, number>,
      expiredItems: get().getExpiredItems().length,
      deletedToday: items.filter((item) => item.deletedAt >= today).length,
      deletedThisWeek: items.filter((item) => item.deletedAt >= thisWeekStart).length,
      deletedThisMonth: items.filter((item) => item.deletedAt >= thisMonthStart).length,
      estimatedSize: items.reduce((total, item) => total + (item.metadata?.fileSize || 0), 0),
    }

    // タイプ別カウント初期化
    const types: TrashItemType[] = ['event', 'task', 'document', 'note', 'tag', 'folder', 'record', 'template']
    types.forEach((type: TrashItemType) => {
      stats.itemsByType[type] = 0
    })

    // タイプ別カウント
    items.forEach((item) => {
      const itemType = item.type as TrashItemType
      stats.itemsByType[itemType] = (stats.itemsByType[itemType] || 0) + 1
    })

    return stats
  },

  // エラークリア
  clearError: () => {
    set({ error: null })
  },
}))

/**
 * タイプ別の復元処理
 */
async function restoreItemByType(item: TrashItem): Promise<void> {
  switch (item.type) {
    // TODO(#621): Events/Tasks削除後、plans/Sessionsに移行予定
    case 'event': {
      // Dynamically import to avoid circular dependencies
      // const { useEventStore } = await import('@/features/events/stores/useEventStore')
      // const eventStore = useEventStore.getState()
      // await eventStore.restoreEvent(item.originalData)
      console.log('TODO: Sessions統合後に実装')
      break
    }

    case 'task': {
      // Dynamically import to avoid circular dependencies
      // const { useTaskStore } = await import('@/features/tasks/stores/useTaskStore')
      // const taskStore = useTaskStore.getState()
      // await taskStore.createTask(item.originalData)
      console.log('TODO: Sessions統合後に実装')
      break
    }

    // 他のタイプも同様に実装
    case 'document':
    case 'note':
    case 'tag':
    case 'folder':
    case 'record':
    case 'template':
      console.warn(`Restore not implemented for type: ${item.type}`)
      break

    default:
      throw new Error(`Unknown item type: ${item.type}`)
  }
}

// 自動クリーンアップの設定（アプリ起動時に実行）
if (isBrowser) {
  // 1日1回のクリーンアップ
  const lastCleanup = localStorage.getItem('trash-last-cleanup')
  const today = new Date().toDateString()

  if (lastCleanup !== today) {
    setTimeout(() => {
      const store = useTrashStore.getState()
      store.clearExpiredItems()
      localStorage.setItem('trash-last-cleanup', today)
    }, 5000) // アプリ起動5秒後に実行
  }
}
