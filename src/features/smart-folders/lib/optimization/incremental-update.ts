/**
 * インクリメンタル更新管理
 */

export class IncrementalUpdateManager {
  private static changeTracking: Map<
    string,
    {
      lastUpdated: Date
      changeCount: number
      affectedItems: Set<string>
    }
  > = new Map()

  private static observers: Map<string, Function[]> = new Map()

  /**
   * アイテムの変更を追跡
   */
  static trackChange(itemId: string, changeType: 'create' | 'update' | 'delete', fields?: string[]) {
    const tracking = this.changeTracking.get(itemId) || {
      lastUpdated: new Date(),
      changeCount: 0,
      affectedItems: new Set(),
    }

    tracking.lastUpdated = new Date()
    tracking.changeCount++
    tracking.affectedItems.add(itemId)

    this.changeTracking.set(itemId, tracking)

    // 関連するスマートフォルダに通知
    this.notifyAffectedFolders(itemId, changeType, fields)
  }

  /**
   * バッチ更新の処理
   */
  static processBatchUpdates(items: unknown[], batchSize: number = 100): Promise<void> {
    return new Promise((resolve) => {
      const batches = this.createBatches(items, batchSize)
      let processed = 0

      const processBatch = () => {
        if (processed >= batches.length) {
          resolve()
          return
        }

        const batch = batches[processed]
        if (!batch) return

        // 非同期でバッチを処理
        setTimeout(() => {
          batch.forEach((item) => {
            // 型アサーション: itemはidプロパティを持つオブジェクト
            const typedItem = item as { id: string }
            this.trackChange(typedItem.id, 'update')
          })

          processed++
          processBatch()
        }, 0)
      }

      processBatch()
    })
  }

  /**
   * 差分更新の取得
   */
  static getDeltaUpdates(since: Date): Array<{
    itemId: string
    lastUpdated: Date
    changeCount: number
  }> {
    return Array.from(this.changeTracking.entries())
      .filter(([_, tracking]) => tracking.lastUpdated > since)
      .map(([itemId, tracking]) => ({
        itemId,
        lastUpdated: tracking.lastUpdated,
        changeCount: tracking.changeCount,
      }))
  }

  /**
   * オブザーバーの登録
   */
  static subscribe(folderId: string, callback: Function) {
    if (!this.observers.has(folderId)) {
      this.observers.set(folderId, [])
    }
    this.observers.get(folderId)!.push(callback)
  }

  /**
   * オブザーバーの削除
   */
  static unsubscribe(folderId: string, callback: Function) {
    const callbacks = this.observers.get(folderId)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 影響を受けるフォルダに通知
   */
  private static notifyAffectedFolders(itemId: string, changeType: string, fields?: string[]) {
    // 全フォルダのオブザーバーに通知（実際はより効率的な実装が必要）
    this.observers.forEach((callbacks, _folderId) => {
      callbacks.forEach((callback) => {
        callback({ itemId, changeType, fields, timestamp: new Date() })
      })
    })
  }

  /**
   * バッチの作成
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }
}
