/**
 * 統一ゴミ箱システムの型定義
 * すべての削除可能なアイテムを一元管理するシステム
 */

export type TrashItemType =
  | 'event' // カレンダーイベント
  | 'task' // タスク
  | 'document' // ドキュメント
  | 'note' // メモ・ノート
  | 'tag' // タグ
  | 'folder' // フォルダ・カテゴリ
  | 'record' // 記録・レコード
  | 'template' // テンプレート

/**
 * ゴミ箱内のアイテム
 */
export interface TrashItem {
  /** アイテムのユニークID */
  id: string

  /** アイテムのタイプ */
  type: TrashItemType

  /** 表示用のタイトル */
  title: string

  /** 説明・詳細（任意） */
  description?: string

  /** 削除された日時 */
  deletedAt: Date

  /** 削除元のパス（復元時のヒント） */
  deletedFrom?: string

  /** 復元用の完全なデータ */
  originalData: Record<string, unknown>

  /** 表示用のメタデータ */
  metadata?: {
    /** アイテムの色 */
    color?: string

    /** アイテムのアイコン */
    icon?: string

    /** 関連するタグ */
    tags?: string[]

    /** 親アイテムのID */
    parentId?: string

    /** 画像URL（サムネイル用） */
    imageUrl?: string

    /** サブタイトル・詳細情報 */
    subtitle?: string

    /** 重要度・優先度 */
    priority?: 'low' | 'medium' | 'high'

    /** ファイルサイズ（適用可能な場合） */
    fileSize?: number
  }
}

/**
 * フィルター条件
 */
export interface TrashFilters {
  /** 表示するアイテムタイプ */
  types: TrashItemType[]

  /** 検索クエリ */
  searchQuery: string

  /** 削除日の範囲フィルター */
  dateRange: {
    from: Date | null
    to: Date | null
  }

  /** 削除元フィルター */
  deletedFrom?: string[]

  /** 優先度フィルター */
  priority?: ('low' | 'medium' | 'high')[]
}

/**
 * ソート設定
 */
export interface TrashSort {
  /** ソート基準 */
  by: 'deletedAt' | 'title' | 'type' | 'priority'

  /** ソート順序 */
  order: 'asc' | 'desc'
}

/**
 * ゴミ箱の状態
 */
export interface TrashState {
  /** ゴミ箱内のアイテム */
  items: TrashItem[]

  /** 選択中のアイテムID */
  selectedIds: Set<string>

  /** フィルター設定 */
  filters: TrashFilters

  /** ソート設定 */
  sort: TrashSort

  /** ローディング状態 */
  loading: boolean

  /** エラーメッセージ */
  error: string | null

  /** 最後にフェッチした日時 */
  lastFetched: Date | null
}

/**
 * ゴミ箱ストアのアクション
 */
export interface TrashActions {
  // アイテム操作
  addItem: (item: Omit<TrashItem, 'deletedAt'>) => Promise<void>
  addItems: (items: Omit<TrashItem, 'deletedAt'>[]) => Promise<void>
  removeItem: (id: string) => void
  removeItems: (ids: string[]) => void

  // 復元処理
  restoreItem: (id: string) => Promise<void>
  restoreItems: (ids: string[]) => Promise<RestoreResult | undefined>

  // 完全削除
  permanentlyDelete: (id: string) => Promise<void>
  permanentlyDeleteItems: (ids: string[]) => Promise<void>

  // 一括操作
  emptyTrash: () => Promise<void>
  clearExpiredItems: () => Promise<void>

  // 選択操作
  selectItem: (id: string) => void
  selectItems: (ids: string[]) => void
  deselectItem: (id: string) => void
  deselectItems: (ids: string[]) => void
  selectAll: () => void
  deselectAll: () => void

  // フィルター・ソート
  setFilters: (filters: Partial<TrashFilters>) => void
  clearFilters: () => void
  setSort: (sort: Partial<TrashSort>) => void

  // データ取得
  fetchItems: () => Promise<void>
  getFilteredItems: () => TrashItem[]
  getExpiredItems: (days?: number) => TrashItem[]
  getItemsByType: (type: TrashItemType) => TrashItem[]

  // 統計情報
  getStats: () => TrashStats

  // エラー処理
  clearError: () => void
}

/**
 * ゴミ箱ストア
 */
export interface TrashStore extends TrashState, TrashActions {}

/**
 * 統計情報
 */
export interface TrashStats {
  /** 総アイテム数 */
  totalItems: number

  /** タイプ別アイテム数 */
  itemsByType: Record<TrashItemType, number>

  /** 30日以上経過したアイテム数 */
  expiredItems: number

  /** 今日削除されたアイテム数 */
  deletedToday: number

  /** 今週削除されたアイテム数 */
  deletedThisWeek: number

  /** 今月削除されたアイテム数 */
  deletedThisMonth: number

  /** 推定ディスク使用量 */
  estimatedSize: number
}

/**
 * 復元結果
 */
export interface RestoreResult {
  /** 成功したアイテム数 */
  success: number

  /** 失敗したアイテム数 */
  failed: number

  /** エラーメッセージ */
  errors: string[]

  /** 復元されたアイテムID */
  restoredIds: string[]
}

/**
 * 削除結果
 */
export interface DeleteResult {
  /** 削除されたアイテム数 */
  deletedCount: number

  /** エラーメッセージ */
  errors: string[]
}

/**
 * TrashItemのタイプガード関数
 */
export const isTrashItem = (item: unknown): item is TrashItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    typeof item.title === 'string' &&
    item.deletedAt instanceof Date &&
    typeof item.originalData === 'object'
  )
}

/**
 * TrashItemTypeの判定関数
 */
export const isValidTrashItemType = (type: string): type is TrashItemType => {
  const validTypes: TrashItemType[] = ['event', 'task', 'document', 'note', 'tag', 'folder', 'record', 'template']
  return validTypes.includes(type as TrashItemType)
}

/**
 * タイプ別のアイコン・色定義
 */
export const TRASH_ITEM_CONFIG: Record<
  TrashItemType,
  {
    icon: string
    color: string
    label: string
  }
> = {
  event: {
    icon: '📅',
    color: '#3B82F6',
    label: 'イベント',
  },
  task: {
    icon: '✅',
    color: '#10B981',
    label: 'タスク',
  },
  document: {
    icon: '📄',
    color: '#6366F1',
    label: 'ドキュメント',
  },
  note: {
    icon: '📝',
    color: '#F59E0B',
    label: 'ノート',
  },
  tag: {
    icon: '🏷️',
    color: '#8B5CF6',
    label: 'タグ',
  },
  folder: {
    icon: '📁',
    color: '#06B6D4',
    label: 'フォルダ',
  },
  record: {
    icon: '📊',
    color: '#EF4444',
    label: 'レコード',
  },
  template: {
    icon: '📋',
    color: '#64748B',
    label: 'テンプレート',
  },
}

/**
 * 30日後に自動削除される警告日数
 */
export const TRASH_RETENTION_DAYS = 30
export const TRASH_WARNING_DAYS = 7 // 残り7日以下で警告表示
