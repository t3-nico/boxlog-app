// スマートフォルダ パフォーマンス最適化

import { SmartFolder, SmartFolderRule } from '@/types/smart-folders'
import { AdvancedRuleEngine } from './rule-engine'

// インデックスマネージャー
export class IndexManager {
  private static indexes: Map<string, Map<any, Set<string>>> = new Map()

  /**
   * フィールドインデックスの構築
   */
  static buildIndex<T extends { id: string }>(
    items: T[], 
    field: string
  ): Map<any, Set<string>> {
    const index = new Map<any, Set<string>>()
    
    for (const item of items) {
      const value = this.getFieldValue(item, field)
      if (value !== undefined) {
        const normalizedValue = this.normalizeValue(value)
        
        if (!index.has(normalizedValue)) {
          index.set(normalizedValue, new Set())
        }
        index.get(normalizedValue)!.add(item.id)
      }
    }
    
    this.indexes.set(field, index)
    return index
  }

  /**
   * 複数フィールドのインデックスを一括構築
   */
  static buildIndexes<T extends { id: string }>(
    items: T[], 
    fields: string[]
  ): void {
    for (const field of fields) {
      this.buildIndex(items, field)
    }
  }

  /**
   * インデックスを使用した高速フィルタリング
   */
  static filterUsingIndex<T extends { id: string }>(
    items: T[],
    rule: SmartFolderRule
  ): T[] {
    const index = this.indexes.get(rule.field)
    if (!index) {
      // インデックスがない場合は通常の評価
      return items.filter(item => 
        AdvancedRuleEngine.evaluateRule(item, rule)
      )
    }

    const matchingIds = new Set<string>()
    
    switch (rule.operator) {
      case 'equals':
        const normalizedValue = this.normalizeValue(rule.value)
        const ids = index.get(normalizedValue)
        if (ids) {
          ids.forEach(id => matchingIds.add(id))
        }
        break
        
      case 'contains':
        // 部分一致の場合はインデックスの全エントリをチェック
        for (const [value, ids] of Array.from(index.entries())) {
          if (String(value).includes(String(rule.value))) {
            ids.forEach(id => matchingIds.add(id))
          }
        }
        break
        
      default:
        // その他の演算子は通常の評価にフォールバック
        return items.filter(item => 
          AdvancedRuleEngine.evaluateRule(item, rule)
        )
    }
    
    // IDに基づいてアイテムをフィルタリング
    const idMap = new Map(items.map(item => [item.id, item]))
    return Array.from(matchingIds)
      .map(id => idMap.get(id))
      .filter((item): item is T => item !== undefined)
  }

  /**
   * インデックスのクリア
   */
  static clearIndexes(): void {
    this.indexes.clear()
  }

  /**
   * フィールド値の取得
   */
  private static getFieldValue(item: any, field: string): any {
    const keys = field.split('.')
    let value = item
    
    for (const key of keys) {
      value = value?.[key]
    }
    
    return value
  }

  /**
   * 値の正規化
   */
  private static normalizeValue(value: any): any {
    if (typeof value === 'string') {
      return value.toLowerCase().trim()
    }
    if (value instanceof Date) {
      return value.toISOString()
    }
    return value
  }
}

// バッチプロセッサー
export class BatchProcessor {
  /**
   * アイテムのバッチ処理（並列処理）
   */
  static async processBatch<T>(
    items: T[],
    processor: (item: T) => Promise<any>,
    options: {
      batchSize?: number
      concurrency?: number
      onProgress?: (processed: number, total: number) => void
    } = {}
  ): Promise<any[]> {
    const {
      batchSize = 100,
      concurrency = 4,
      onProgress
    } = options

    const results: any[] = []
    const batches = this.createBatches(items, batchSize)
    
    for (let i = 0; i < batches.length; i += concurrency) {
      const currentBatches = batches.slice(i, i + concurrency)
      
      const batchResults = await Promise.all(
        currentBatches.map(batch => 
          this.processSingleBatch(batch, processor)
        )
      )
      
      results.push(...batchResults.flat())
      
      if (onProgress) {
        const processed = Math.min((i + concurrency) * batchSize, items.length)
        onProgress(processed, items.length)
      }
    }
    
    return results
  }

  /**
   * 単一バッチの処理
   */
  private static async processSingleBatch<T>(
    batch: T[],
    processor: (item: T) => Promise<any>
  ): Promise<any[]> {
    return Promise.all(batch.map(processor))
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

// クエリオプティマイザー
export class QueryOptimizer {
  /**
   * ルールセットの最適化
   */
  static optimizeRules(rules: SmartFolderRule[]): SmartFolderRule[] {
    // 1. 簡単な条件を先に評価
    const sortedRules = [...rules].sort((a, b) => {
      const scoreA = this.getRuleComplexityScore(a)
      const scoreB = this.getRuleComplexityScore(b)
      return scoreA - scoreB
    })
    
    // 2. 同じフィールドのルールをグループ化
    const groupedRules = this.groupRulesByField(sortedRules)
    
    // 3. 冗長なルールを削除
    return this.removeRedundantRules(groupedRules)
  }

  /**
   * ルールの複雑度スコア計算
   */
  private static getRuleComplexityScore(rule: SmartFolderRule): number {
    const operatorScores: Record<string, number> = {
      'is_empty': 1,
      'is_not_empty': 1,
      'equals': 2,
      'not_equals': 2,
      'contains': 3,
      'not_contains': 3,
      'starts_with': 3,
      'ends_with': 3,
      'greater_than': 4,
      'less_than': 4,
      'greater_equal': 4,
      'less_equal': 4
    }
    
    const fieldScores: Record<string, number> = {
      'is_favorite': 1,
      'status': 2,
      'priority': 2,
      'tag': 3,
      'title': 3,
      'description': 4,
      'created_date': 4,
      'updated_date': 4,
      'due_date': 4
    }
    
    const operatorScore = operatorScores[rule.operator] || 5
    const fieldScore = fieldScores[rule.field] || 3
    
    return operatorScore + fieldScore
  }

  /**
   * フィールドごとにルールをグループ化
   */
  private static groupRulesByField(rules: SmartFolderRule[]): SmartFolderRule[] {
    const groups = new Map<string, SmartFolderRule[]>()
    
    for (const rule of rules) {
      if (!groups.has(rule.field)) {
        groups.set(rule.field, [])
      }
      groups.get(rule.field)!.push(rule)
    }
    
    // グループを結合
    const result: SmartFolderRule[] = []
    for (const group of Array.from(groups.values())) {
      result.push(...group)
    }
    
    return result
  }

  /**
   * 冗長なルールの削除
   */
  private static removeRedundantRules(rules: SmartFolderRule[]): SmartFolderRule[] {
    const result: SmartFolderRule[] = []
    const seen = new Set<string>()
    
    for (const rule of rules) {
      const key = `${rule.field}-${rule.operator}-${JSON.stringify(rule.value)}`
      
      if (!seen.has(key)) {
        seen.add(key)
        result.push(rule)
      }
    }
    
    return result
  }
}

// メモリキャッシュマネージャー
export class CacheManager {
  private static cache: Map<string, {
    data: any
    timestamp: number
    hits: number
  }> = new Map()
  
  private static maxSize = 1000
  private static ttl = 5 * 60 * 1000 // 5分

  /**
   * キャッシュに保存
   */
  static set(key: string, data: any): void {
    // サイズ制限チェック
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed()
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    })
  }

  /**
   * キャッシュから取得
   */
  static get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // 有効期限チェック
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    // ヒット数を増加
    entry.hits++
    
    return entry.data
  }

  /**
   * キャッシュのクリア
   */
  static clear(): void {
    this.cache.clear()
  }

  /**
   * 最も使用頻度の低いエントリを削除
   */
  private static evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let minHits = Infinity
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.hits < minHits) {
        minHits = entry.hits
        leastUsedKey = key
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }

  /**
   * キャッシュ統計の取得
   */
  static getStats(): {
    size: number
    maxSize: number
    hitRate: number
  } {
    let totalHits = 0
    let totalRequests = 0
    
    for (const entry of Array.from(this.cache.values())) {
      totalHits += entry.hits
      totalRequests += entry.hits + 1
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0
    }
  }
}

// パフォーマンスモニター
export class PerformanceMonitor {
  private static metrics: Map<string, {
    count: number
    totalTime: number
    minTime: number
    maxTime: number
  }> = new Map()

  /**
   * パフォーマンス計測
   */
  static async measure<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      
      this.recordMetric(name, duration)
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordMetric(`${name}_error`, duration)
      throw error
    }
  }

  /**
   * メトリクスの記録
   */
  private static recordMetric(name: string, duration: number): void {
    const metric = this.metrics.get(name) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0
    }
    
    metric.count++
    metric.totalTime += duration
    metric.minTime = Math.min(metric.minTime, duration)
    metric.maxTime = Math.max(metric.maxTime, duration)
    
    this.metrics.set(name, metric)
  }

  /**
   * メトリクスの取得
   */
  static getMetrics(): Record<string, {
    count: number
    averageTime: number
    minTime: number
    maxTime: number
  }> {
    const result: Record<string, any> = {}
    
    for (const [name, metric] of Array.from(this.metrics.entries())) {
      result[name] = {
        count: metric.count,
        averageTime: metric.totalTime / metric.count,
        minTime: metric.minTime,
        maxTime: metric.maxTime
      }
    }
    
    return result
  }

  /**
   * メトリクスのリセット
   */
  static reset(): void {
    this.metrics.clear()
  }
}