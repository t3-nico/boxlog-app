import { 
  TrashItem, 
  TrashItemType, 
  TRASH_ITEM_CONFIG, 
  TRASH_RETENTION_DAYS, 
  TRASH_WARNING_DAYS 
} from '../types/trash'

/**
 * ゴミ箱操作のユーティリティ関数
 */
export const trashOperations = {
  
  /**
   * アイテムがまもなく期限切れになるかチェック
   */
  isExpiringSoon: (item: TrashItem, warningDays = TRASH_WARNING_DAYS): boolean => {
    const now = new Date()
    const expirationDate = new Date(item.deletedAt)
    expirationDate.setDate(expirationDate.getDate() + TRASH_RETENTION_DAYS)
    
    const warningDate = new Date(expirationDate)
    warningDate.setDate(warningDate.getDate() - warningDays)
    
    return now >= warningDate && now < expirationDate
  },

  /**
   * アイテムが期限切れかチェック
   */
  isExpired: (item: TrashItem, retentionDays = TRASH_RETENTION_DAYS): boolean => {
    const now = new Date()
    const expirationDate = new Date(item.deletedAt)
    expirationDate.setDate(expirationDate.getDate() + retentionDays)
    
    return now >= expirationDate
  },

  /**
   * 自動削除までの日数を計算
   */
  getDaysUntilAutoDelete: (item: TrashItem): number => {
    const now = new Date()
    const expirationDate = new Date(item.deletedAt)
    expirationDate.setDate(expirationDate.getDate() + TRASH_RETENTION_DAYS)
    
    const diffTime = expirationDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  },

  /**
   * 削除日時を人間が読みやすい形式でフォーマット
   */
  formatDeletedDate: (deletedAt: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - deletedAt.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) {
      return 'たった今'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else if (diffDays === 1) {
      return '昨日'
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `${diffWeeks}週間前`
    } else {
      const diffMonths = Math.floor(diffDays / 30)
      return `${diffMonths}ヶ月前`
    }
  },

  /**
   * アイテムタイプの設定を取得
   */
  getTypeConfig: (type: TrashItemType) => {
    return TRASH_ITEM_CONFIG[type] || {
      icon: '❓',
      color: '#6B7280',
      label: 'Unknown'
    }
  },

  /**
   * アイテムタイトルを適切な長さに切り詰め
   */
  truncateTitle: (title: string, maxLength = 50): string => {
    if (title.length <= maxLength) return title
    return `${title.slice(0, maxLength - 3)  }...`
  },

  /**
   * アイテムの説明を切り詰め
   */
  truncateDescription: (description: string | undefined, maxLength = 100): string => {
    if (!description) return ''
    if (description.length <= maxLength) return description
    return `${description.slice(0, maxLength - 3)  }...`
  },

  /**
   * ファイルサイズを人間が読みやすい形式でフォーマット
   */
  formatFileSize: (sizeInBytes: number | undefined): string => {
    if (!sizeInBytes || sizeInBytes === 0) return ''
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = sizeInBytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  },

  /**
   * 削除元パスを人間が読みやすい形式でフォーマット
   */
  formatDeletedFrom: (deletedFrom: string | undefined): string => {
    if (!deletedFrom) return ''
    
    const pathMap: Record<string, string> = {
      '/calendar': 'カレンダー',
      '/tasks': 'タスク',
      '/documents': 'ドキュメント',
      '/notes': 'ノート',
      '/settings': '設定'
    }
    
    return pathMap[deletedFrom] || deletedFrom
  },

  /**
   * 優先度を色付きで表示するためのクラス名を取得
   */
  getPriorityClass: (priority: 'low' | 'medium' | 'high' | undefined): string => {
    const priorityClasses = {
      low: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
      medium: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
      high: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    }
    
    return priorityClasses[priority || 'medium']
  },

  /**
   * タグを表示用に処理
   */
  formatTags: (tags: string[] | undefined, maxTags = 3): { 
    visible: string[]
    hidden: number 
  } => {
    if (!tags || tags.length === 0) {
      return { visible: [], hidden: 0 }
    }
    
    if (tags.length <= maxTags) {
      return { visible: tags, hidden: 0 }
    }
    
    return {
      visible: tags.slice(0, maxTags),
      hidden: tags.length - maxTags
    }
  },

  /**
   * 復元時の検証を行う
   */
  validateRestore: (item: TrashItem): { canRestore: boolean; reason?: string } => {
    if (!item.originalData) {
      return { canRestore: false, reason: '復元データが見つかりません' }
    }

    // 期限切れチェック（期限切れでも復元可能だが警告を出す）
    if (trashOperations.isExpired(item)) {
      return { 
        canRestore: true, 
        reason: 'このアイテムは保持期限を過ぎていますが、復元できます' 
      }
    }

    return { canRestore: true }
  },

  /**
   * アイテムを削除元のパスでグループ化
   */
  groupByDeletedFrom: (items: TrashItem[]): Record<string, TrashItem[]> => {
    return items.reduce((groups, item) => {
      const key = item.deletedFrom || 'その他'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {} as Record<string, TrashItem[]>)
  },

  /**
   * アイテムをタイプでグループ化
   */
  groupByType: (items: TrashItem[]): Record<TrashItemType, TrashItem[]> => {
    const groups = {} as Record<TrashItemType, TrashItem[]>
    
    // 全タイプの初期化
    const types: TrashItemType[] = [
      'event', 'task', 'document', 'note', 
      'tag', 'folder', 'record', 'template'
    ]
    types.forEach(type => {
      groups[type] = []
    })
    
    // アイテムを分類
    items.forEach(item => {
      if (groups[item.type]) {
        groups[item.type].push(item)
      }
    })
    
    return groups
  },

  /**
   * アイテムを削除日でグループ化
   */
  groupByDeletedDate: (items: TrashItem[]): Record<string, TrashItem[]> => {
    return items.reduce((groups, item) => {
      const dateKey = item.deletedAt.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
      return groups
    }, {} as Record<string, TrashItem[]>)
  },

  /**
   * 検索クエリでアイテムをフィルタリング
   */
  searchItems: (items: TrashItem[], query: string): TrashItem[] => {
    if (!query.trim()) return items
    
    const lowerQuery = query.toLowerCase()
    
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery) ||
      item.deletedFrom?.toLowerCase().includes(lowerQuery) ||
      item.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  },

  /**
   * 日付範囲でアイテムをフィルタリング
   */
  filterByDateRange: (
    items: TrashItem[], 
    from: Date | null, 
    to: Date | null
  ): TrashItem[] => {
    if (!from && !to) return items
    
    return items.filter(item => {
      const deletedAt = item.deletedAt.getTime()
      const fromTime = from?.getTime() || 0
      const toTime = to?.getTime() || Date.now()
      
      return deletedAt >= fromTime && deletedAt <= toTime
    })
  },

  /**
   * アイテムの選択状態を切り替えるためのヘルパー
   */
  toggleSelection: (
    selectedIds: Set<string>,
    itemId: string,
    multiSelect = false
  ): Set<string> => {
    const newSelected = new Set(selectedIds)
    
    if (!multiSelect) {
      newSelected.clear()
    }
    
    if (selectedIds.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    
    return newSelected
  },

  /**
   * 統計情報の計算ヘルパー
   */
  calculateStats: (items: TrashItem[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    
    return {
      total: items.length,
      deletedToday: items.filter(item => item.deletedAt >= today).length,
      deletedThisWeek: items.filter(item => item.deletedAt >= thisWeekStart).length,
      expiringSoon: items.filter(item => trashOperations.isExpiringSoon(item)).length,
      expired: items.filter(item => trashOperations.isExpired(item)).length,
      totalSize: items.reduce((total, item) => total + (item.metadata?.fileSize || 0), 0)
    }
  },

  /**
   * エクスポート用のデータ準備
   */
  prepareExportData: (items: TrashItem[]) => {
    return items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      deletedAt: item.deletedAt.toISOString(),
      deletedFrom: item.deletedFrom,
      daysUntilAutoDelete: trashOperations.getDaysUntilAutoDelete(item),
      isExpired: trashOperations.isExpired(item),
      isExpiringSoon: trashOperations.isExpiringSoon(item),
      tags: item.metadata?.tags,
      priority: item.metadata?.priority,
      fileSize: item.metadata?.fileSize
    }))
  }
}

/**
 * ゴミ箱アイテムの検証
 */
export const validateTrashItem = (item: unknown): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!item.id || typeof item.id !== 'string') {
    errors.push('IDが必要です')
  }
  
  if (!item.type || typeof item.type !== 'string') {
    errors.push('タイプが必要です')
  }
  
  if (!item.title || typeof item.title !== 'string') {
    errors.push('タイトルが必要です')
  }
  
  if (!item.deletedAt || !(item.deletedAt instanceof Date)) {
    errors.push('削除日時が必要です')
  }
  
  if (!item.originalData) {
    errors.push('復元用のデータが必要です')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}