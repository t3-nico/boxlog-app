/**
 * バックグラウンド同期マネージャー
 */

export class BackgroundSyncManager {
  private static syncInterval: NodeJS.Timeout | null = null
  private static syncQueue: Array<{
    type: 'folder' | 'item'
    id: string
    operation: 'create' | 'update' | 'delete'
    data?: unknown
    priority: number
  }> = []

  /**
   * バックグラウンド同期の開始
   */
  static startSync(intervalMs: number = 30000) {
    if (this.syncInterval) return

    this.syncInterval = setInterval(() => {
      this.processSyncQueue()
    }, intervalMs)
  }

  /**
   * バックグラウンド同期の停止
   */
  static stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * 同期キューに追加
   */
  static enqueue(item: {
    type: 'folder' | 'item'
    id: string
    operation: 'create' | 'update' | 'delete'
    data?: unknown
    priority?: number
  }) {
    this.syncQueue.push({
      ...item,
      priority: item.priority || 1,
    })

    // 優先度で並び替え
    this.syncQueue.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 同期キューの処理
   */
  private static async processSyncQueue() {
    if (this.syncQueue.length === 0) return

    const batch = this.syncQueue.splice(0, 10) // 一度に10個まで処理

    try {
      await Promise.all(batch.map((item) => this.syncItem(item)))
    } catch (error) {
      console.error('Background sync error:', error)
      // エラーのあったアイテムをキューに戻す
      this.syncQueue.unshift(...batch)
    }
  }

  /**
   * 個別アイテムの同期
   */
  private static async syncItem(item: {
    type: 'folder' | 'item'
    id: string
    operation: 'create' | 'update' | 'delete'
    data?: unknown
    priority: number
  }): Promise<void> {
    const endpoint = item.type === 'folder' ? '/api/smart-folders' : '/api/items'
    const url = item.operation === 'create' ? endpoint : `${endpoint}/${item.id}`

    const method = (
      {
        create: 'POST',
        update: 'PUT',
        delete: 'DELETE',
      } as Record<string, string>
    )[item.operation]

    const requestInit: RequestInit = {
      method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      headers: item.operation === 'delete' ? {} : { 'Content-Type': 'application/json' },
    }

    if (item.operation !== 'delete') {
      requestInit.body = JSON.stringify(item.data)
    }

    const response = await fetch(url, requestInit)

    if (!response.ok) {
      throw new Error(`Sync failed for ${item.type} ${item.id}`)
    }
  }
}
