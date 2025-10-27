import type { SmartFolder, Tag, Task } from './unified'

// 削除されたアイテムのデータ型
// 注: Event型は削除済み（Ticketsに移行）
export type DeletedItemData = Task | Tag | SmartFolder

export interface DeletedItem {
  id: string
  originalId: string
  type: 'task' | 'event' | 'tag' | 'smart-folder'
  data: DeletedItemData
  deletedAt: Date
  deletedBy: string
  expiresAt: Date // deletedAt + 30日
  originalPath?: string // 元の場所（フォルダパスなど）
}

export interface TrashStats {
  totalItems: number
  itemsByType: Record<string, number>
  oldestItem?: Date
  totalSize?: string // 容量（将来的に）
}

export interface TrashState {
  deletedItems: DeletedItem[]
  loading: boolean

  // アクション
  moveToTrash: (_item: DeletedItemData, _type: DeletedItem['type']) => Promise<void>
  restoreItem: (_deletedItemId: string) => Promise<void>
  permanentDelete: (_deletedItemId: string) => Promise<void>
  emptyTrash: () => Promise<void>
  loadTrashItems: () => Promise<void>
  getTrashStats: () => TrashStats
}
