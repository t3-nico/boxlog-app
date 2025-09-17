/**
 * 統一ゴミ箱システム - エクスポート
 */

// 型定義
export type {
  TrashItem,
  TrashItemType,
  TrashFilters as TrashFiltersType,
  TrashSort,
  TrashState,
  TrashActions as TrashActionsType,
  TrashStore,
  TrashStats,
  RestoreResult,
  DeleteResult
} from './types/trash'

export {
  TRASH_ITEM_CONFIG,
  TRASH_RETENTION_DAYS,
  TRASH_WARNING_DAYS,
  isTrashItem,
  isValidTrashItemType
} from './types/trash'

// ストア
export { useTrashStore } from './stores/useTrashStore'

// ユーティリティ
export { trashOperations, validateTrashItem } from './utils/trash-operations'

// コンポーネント
export { TrashView } from './components/TrashView'
export { TrashTable } from './components/TrashTable'
export { TrashActions } from './components/TrashActions'

/**
 * 統一ゴミ箱ヘルパー関数
 * 各featureから簡単に削除アイテムを追加できるように
 */
export const addToTrash = async (item: {
  id: string
  type: 'event' | 'task' | 'document' | 'note' | 'tag' | 'folder' | 'record' | 'template'
  title: string
  description?: string
  deletedFrom?: string
  originalData: Record<string, unknown>
  metadata?: {
    color?: string
    icon?: string
    tags?: string[]
    parentId?: string
    imageUrl?: string
    subtitle?: string
    priority?: 'low' | 'medium' | 'high'
    fileSize?: number
  }
}) => {
  const { useTrashStore } = await import('./stores/useTrashStore')
  return useTrashStore.getState().addItem(item)
}

/**
 * 複数アイテムをゴミ箱に追加するヘルパー
 */
export const addMultipleToTrash = async (items: Parameters<typeof addToTrash>[0][]) => {
  const { useTrashStore } = await import('./stores/useTrashStore')
  return useTrashStore.getState().addItems(items)
}