// スマートフォルダパフォーマンス最適化システム

import { SmartFolder } from '@/types/smart-folders'

// インクリメンタル更新管理
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

        // 非同期でバッチを処理
        setTimeout(() => {
          batch.forEach((item) => {
            this.trackChange(item.id, 'update')
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

// バックグラウンド同期
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

    const response = await fetch(url, {
      method,
      headers: item.operation === 'delete' ? {} : { 'Content-Type': 'application/json' },
      body: item.operation === 'delete' ? undefined : JSON.stringify(item.data),
    })

    if (!response.ok) {
      throw new Error(`Sync failed for ${item.type} ${item.id}`)
    }
  }
}

// 高度なキャッシュ戦略
export class AdvancedCacheManager {
  private static cache: Map<
    string,
    {
      data: unknown
      timestamp: number
      hits: number
      computeCost: number
      dependencies: Set<string>
    }
  > = new Map()

  private static readonly TTL = 5 * 60 * 1000 // 5分
  private static readonly MAX_SIZE = 1000

  /**
   * 依存関係を考慮したキャッシュ
   */
  static setWithDependencies(key: string, data: unknown, dependencies: string[] = [], computeCost: number = 1) {
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastEfficient()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
      computeCost,
      dependencies: new Set(dependencies),
    })
  }

  /**
   * キャッシュの取得
   */
  static get(key: string): unknown | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    // TTLチェック
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    entry.hits++
    return entry.data
  }

  /**
   * 依存関係による無効化
   */
  static invalidateByDependency(dependency: string) {
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.dependencies.has(dependency)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 効率の悪いエントリを削除
   */
  private static evictLeastEfficient() {
    let leastEfficient: string | null = null
    let minEfficiency = Infinity

    for (const [key, entry] of Array.from(this.cache.entries())) {
      // 効率性 = ヒット数 / 計算コスト / 経過時間
      const age = Date.now() - entry.timestamp
      const efficiency = (entry.hits * entry.computeCost) / (age / 1000)

      if (efficiency < minEfficiency) {
        minEfficiency = efficiency
        leastEfficient = key
      }
    }

    if (leastEfficient) {
      this.cache.delete(leastEfficient)
    }
  }

  /**
   * キャッシュ統計
   */
  static getStats() {
    let totalHits = 0
    let totalComputeCost = 0

    for (const entry of Array.from(this.cache.values())) {
      totalHits += entry.hits
      totalComputeCost += entry.computeCost
    }

    return {
      size: this.cache.size,
      totalHits,
      averageComputeCost: totalComputeCost / this.cache.size || 0,
      hitRate: totalHits / (totalHits + this.cache.size) || 0,
    }
  }
}

// データベースクエリ最適化
export class QueryOptimizer {
  private static queryStats: Map<
    string,
    {
      count: number
      totalTime: number
      avgTime: number
      lastUsed: Date
    }
  > = new Map()

  /**
   * クエリの実行と統計収集
   */
  static async executeQuery<T>(queryId: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now()

    try {
      const result = await queryFn()
      const executionTime = performance.now() - startTime

      this.recordQueryStats(queryId, executionTime)

      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      this.recordQueryStats(`${queryId}_error`, executionTime)
      throw error
    }
  }

  /**
   * スロークエリの検出
   */
  static getSlowQueries(threshold: number = 1000): Array<{
    queryId: string
    avgTime: number
    count: number
  }> {
    return Array.from(this.queryStats.entries())
      .filter(([_, stats]) => stats.avgTime > threshold)
      .map(([queryId, stats]) => ({
        queryId,
        avgTime: stats.avgTime,
        count: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
  }

  /**
   * インデックス最適化の提案
   */
  static suggestIndexes(folder: SmartFolder): string[] {
    const suggestions: string[] = []

    // よく使用されるフィールドのインデックスを提案
    for (const rule of folder.rules) {
      switch (rule.field) {
        case 'created_date':
        case 'updated_date':
        case 'due_date':
          suggestions.push(`CREATE INDEX idx_${rule.field} ON tasks(${rule.field})`)
          break
        case 'status':
        case 'priority':
          suggestions.push(`CREATE INDEX idx_${rule.field} ON tasks(${rule.field})`)
          break
        case 'tag':
          suggestions.push(`CREATE INDEX idx_tags ON tasks USING GIN(tags)`)
          break
      }
    }

    // 複合インデックスの提案
    if (folder.rules.length > 1) {
      const fields = folder.rules.map((r) => r.field).slice(0, 3) // 最大3フィールド
      suggestions.push(`CREATE INDEX idx_composite ON tasks(${fields.join(', ')})`)
    }

    return Array.from(new Set(suggestions)) // 重複を除去
  }

  /**
   * クエリ統計の記録
   */
  private static recordQueryStats(queryId: string, executionTime: number) {
    const stats = this.queryStats.get(queryId) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      lastUsed: new Date(),
    }

    stats.count++
    stats.totalTime += executionTime
    stats.avgTime = stats.totalTime / stats.count
    stats.lastUsed = new Date()

    this.queryStats.set(queryId, stats)
  }
}

// パフォーマンスモニタリング
export class PerformanceMonitor {
  private static metrics: Map<string, unknown[]> = new Map()

  /**
   * メトリクスの記録
   */
  static recordMetric(name: string, value: unknown, metadata?: unknown) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push({
      value,
      timestamp: Date.now(),
      metadata,
    })

    // 古いメトリクスを削除（最新1000件を保持）
    const entries = this.metrics.get(name)!
    if (entries.length > 1000) {
      entries.splice(0, entries.length - 1000)
    }
  }

  /**
   * パフォーマンス警告の検出
   */
  static checkPerformanceWarnings(): Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
    recommendation: string
  }> {
    const warnings: Array<{
      type: string
      message: string
      severity: 'low' | 'medium' | 'high'
      recommendation: string
    }> = []

    // メモリ使用量チェック
    if (AdvancedCacheManager.getStats().size > 800) {
      warnings.push({
        type: 'memory',
        message: 'Cache size is approaching limit',
        severity: 'medium',
        recommendation: 'Consider increasing cache size or reducing TTL',
      })
    }

    // スロークエリチェック
    const slowQueries = QueryOptimizer.getSlowQueries()
    if (slowQueries.length > 0) {
      warnings.push({
        type: 'query',
        message: `${slowQueries.length} slow queries detected`,
        severity: 'high',
        recommendation: 'Review and optimize slow queries, consider adding indexes',
      })
    }

    return warnings
  }

  /**
   * パフォーマンスレポートの生成
   */
  static generateReport(): {
    cacheStats: ReturnType<typeof AdvancedCacheManager.getStats>
    queryStats: ReturnType<typeof QueryOptimizer.getSlowQueries>
    warnings: Array<{
      type: string
      message: string
      severity: 'low' | 'medium' | 'high'
      recommendation: string
    }>
    recommendations: string[]
  } {
    return {
      cacheStats: AdvancedCacheManager.getStats(),
      queryStats: QueryOptimizer.getSlowQueries(),
      warnings: this.checkPerformanceWarnings(),
      recommendations: this.generateRecommendations(),
    }
  }

  /**
   * 最適化推奨事項の生成
   */
  private static generateRecommendations(): string[] {
    const recommendations: string[] = []

    const cacheStats = AdvancedCacheManager.getStats()
    if (cacheStats.hitRate < 0.7) {
      recommendations.push('Improve cache hit rate by adjusting TTL or cache strategy')
    }

    if (cacheStats.averageComputeCost > 10) {
      recommendations.push('Consider pre-computing expensive operations')
    }

    return recommendations
  }
}

// 自動最適化エンジン
export class AutoOptimizationEngine {
  private static isRunning = false
  private static optimizationInterval: NodeJS.Timeout | null = null

  /**
   * 自動最適化の開始
   */
  static startOptimization(intervalMs: number = 5 * 60 * 1000) {
    if (this.isRunning) return

    this.isRunning = true
    this.optimizationInterval = setInterval(() => {
      this.runOptimizationCycle()
    }, intervalMs)
  }

  /**
   * 自動最適化の停止
   */
  static stopOptimization() {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval)
      this.optimizationInterval = null
    }
    this.isRunning = false
  }

  /**
   * 最適化サイクルの実行
   */
  private static async runOptimizationCycle() {
    try {
      // キャッシュの最適化
      await this.optimizeCache()

      // クエリの最適化
      await this.optimizeQueries()

      // メモリの最適化
      await this.optimizeMemory()

      console.log('Auto-optimization cycle completed')
    } catch (error) {
      console.error('Auto-optimization error:', error)
    }
  }

  /**
   * キャッシュの最適化
   */
  private static async optimizeCache() {
    const stats = AdvancedCacheManager.getStats()

    // ヒット率が低い場合はTTLを調整
    if (stats.hitRate < 0.5) {
      // TTLを延長するロジック（実装依存）
      console.log('Optimizing cache TTL')
    }
  }

  /**
   * クエリの最適化
   */
  private static async optimizeQueries() {
    const slowQueries = QueryOptimizer.getSlowQueries(500)

    if (slowQueries.length > 0) {
      console.log(`Found ${slowQueries.length} slow queries for optimization`)
      // 自動インデックス作成やクエリ書き換えのロジック
    }
  }

  /**
   * メモリの最適化
   */
  private static async optimizeMemory() {
    // ガベージコレクションの強制実行
    if (global.gc) {
      global.gc()
    }
  }
}
