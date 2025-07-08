export interface DeletedItem {
  id: string
  originalId: string
  type: 'task' | 'event' | 'tag' | 'smart-folder'
  data: any // 元のオブジェクト
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
  moveToTrash: (item: any, type: DeletedItem['type']) => Promise<void>
  restoreItem: (deletedItemId: string) => Promise<void>
  permanentDelete: (deletedItemId: string) => Promise<void>
  emptyTrash: () => Promise<void>
  loadTrashItems: () => Promise<void>
  getTrashStats: () => TrashStats
}