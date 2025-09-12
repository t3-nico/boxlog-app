/**
 * MemoryOptimizer - メモリ使用量を100MB以下に最適化
 * ガベージコレクション、メモリリーク検出、自動クリーンアップを提供
 */

interface MemoryStats {
  used: number
  total: number
  limit: number
  percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface MemoryConfig {
  maxMemoryMB: number
  warningThresholdMB: number
  gcTriggerPercentage: number
  cleanupIntervalMs: number
  monitoringEnabled: boolean
}

interface MemoryLeak {
  component: string
  type: 'listener' | 'timer' | 'reference' | 'cache'
  severity: 'low' | 'medium' | 'high'
  description: string
  timestamp: number
}

const DEFAULT_CONFIG: MemoryConfig = {
  maxMemoryMB: 100,
  warningThresholdMB: 80,
  gcTriggerPercentage: 85,
  cleanupIntervalMs: 30000, // 30秒
  monitoringEnabled: true
}

export class MemoryOptimizer {
  private config: MemoryConfig
  private listeners: Set<EventListener> = new Set()
  private timers: Set<NodeJS.Timeout> = new Set()
  private intervals: Set<NodeJS.Timer> = new Set()
  private observers: Set<MutationObserver | IntersectionObserver | ResizeObserver> = new Set()
  private weakRefs: Set<WeakRef<any>> = new Set()
  private memoryHistory: MemoryStats[] = []
  private cleanupCallbacks: Map<string, () => void> = new Map()
  private monitoringInterval: NodeJS.Timer | null = null
  private detectedLeaks: MemoryLeak[] = []

  constructor(config?: Partial<MemoryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    if (this.config.monitoringEnabled) {
      this.startMonitoring()
    }
  }

  /**
   * メモリ監視を開始
   */
  startMonitoring(): void {
    if (this.monitoringInterval) return

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage()
      this.detectMemoryLeaks()
      this.performAutoCleanup()
    }, this.config.cleanupIntervalMs)

    console.log('🧠 Memory monitoring started')
  }

  /**
   * メモリ監視を停止
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  /**
   * 現在のメモリ使用量を取得
   */
  getMemoryStats(): MemoryStats {
    const {memory} = (performance as any)
    
    if (!memory) {
      return {
        used: 0,
        total: 0,
        limit: this.config.maxMemoryMB * 1024 * 1024,
        percentage: 0,
        trend: 'stable'
      }
    }

    const used = memory.usedJSHeapSize
    const total = memory.totalJSHeapSize
    const limit = this.config.maxMemoryMB * 1024 * 1024
    const percentage = (used / limit) * 100

    // トレンド判定
    let trend: MemoryStats['trend'] = 'stable'
    if (this.memoryHistory.length > 0) {
      const previous = this.memoryHistory[this.memoryHistory.length - 1]
      const change = (used - previous.used) / previous.used
      
      if (change > 0.05) trend = 'increasing'
      else if (change < -0.05) trend = 'decreasing'
    }

    const stats: MemoryStats = { used, total, limit, percentage, trend }
    
    // 履歴に追加（最新50件のみ保持）
    this.memoryHistory.push(stats)
    if (this.memoryHistory.length > 50) {
      this.memoryHistory.shift()
    }

    return stats
  }

  /**
   * メモリ使用量をチェック
   */
  private checkMemoryUsage(): void {
    const stats = this.getMemoryStats()
    
    // 警告閾値チェック
    if (stats.percentage > (this.config.warningThresholdMB / this.config.maxMemoryMB) * 100) {
      console.warn(`⚠️ Memory usage warning: ${Math.round(stats.percentage)}%`)
      this.triggerCleanup('warning')
    }

    // ガベージコレクション実行閾値チェック
    if (stats.percentage > this.config.gcTriggerPercentage) {
      console.warn(`🗑️ Memory usage critical: ${Math.round(stats.percentage)}% - Triggering GC`)
      this.forceGarbageCollection()
    }
  }

  /**
   * ガベージコレクションの強制実行
   */
  forceGarbageCollection(): void {
    // WeakRefのクリーンアップ
    this.cleanupWeakReferences()
    
    // 手動でのメモリ解放を促進
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    // 大きなオブジェクトの削除を促進
    this.triggerCleanup('gc')
  }

  /**
   * イベントリスナーの追跡登録
   */
  trackEventListener(element: EventTarget, type: string, listener: EventListener, options?: any): void {
    element.addEventListener(type, listener, options)
    this.listeners.add(listener)
    
    // クリーンアップコールバックを登録
    const cleanup = () => {
      element.removeEventListener(type, listener, options)
      this.listeners.delete(listener)
    }
    
    this.cleanupCallbacks.set(`listener_${Date.now()}_${Math.random()}`, cleanup)
  }

  /**
   * タイマーの追跡登録
   */
  trackTimer(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(callback, delay)
    this.timers.add(timer)
    
    // 自動クリーンアップ
    setTimeout(() => {
      this.timers.delete(timer)
    }, delay + 100)
    
    return timer
  }

  /**
   * インターバルの追跡登録
   */
  trackInterval(callback: () => void, delay: number): NodeJS.Timer {
    const interval = setInterval(callback, delay)
    this.intervals.add(interval)
    
    const cleanup = () => {
      clearInterval(interval)
      this.intervals.delete(interval)
    }
    
    this.cleanupCallbacks.set(`interval_${Date.now()}_${Math.random()}`, cleanup)
    return interval
  }

  /**
   * Observerの追跡登録
   */
  trackObserver(observer: MutationObserver | IntersectionObserver | ResizeObserver): void {
    this.observers.add(observer)
    
    const cleanup = () => {
      observer.disconnect()
      this.observers.delete(observer)
    }
    
    this.cleanupCallbacks.set(`observer_${Date.now()}_${Math.random()}`, cleanup)
  }

  /**
   * WeakRefの追跡登録
   */
  trackWeakRef<T extends object>(obj: T): WeakRef<T> {
    const weakRef = new WeakRef(obj)
    this.weakRefs.add(weakRef)
    return weakRef
  }

  /**
   * WeakRefのクリーンアップ
   */
  private cleanupWeakReferences(): void {
    const validRefs = new Set<WeakRef<any>>()
    
    for (const ref of this.weakRefs) {
      if (ref.deref() !== undefined) {
        validRefs.add(ref)
      }
    }
    
    this.weakRefs = validRefs
  }

  /**
   * メモリリークの検出
   */
  private detectMemoryLeaks(): void {
    const stats = this.getMemoryStats()
    
    // 継続的なメモリ増加の検出
    if (this.memoryHistory.length >= 10) {
      const recent = this.memoryHistory.slice(-10)
      const increasing = recent.every((stat, index) => 
        index === 0 || stat.used > recent[index - 1].used
      )
      
      if (increasing) {
        this.reportLeak({
          component: 'general',
          type: 'reference',
          severity: 'medium',
          description: '継続的なメモリ増加を検出',
          timestamp: Date.now()
        })
      }
    }

    // 大量のイベントリスナーの検出
    if (this.listeners.size > 100) {
      this.reportLeak({
        component: 'event-listeners',
        type: 'listener',
        severity: 'high',
        description: `${this.listeners.size}個の追跡されていないイベントリスナー`,
        timestamp: Date.now()
      })
    }

    // タイマーの蓄積検出
    if (this.timers.size > 50) {
      this.reportLeak({
        component: 'timers',
        type: 'timer',
        severity: 'medium',
        description: `${this.timers.size}個のアクティブなタイマー`,
        timestamp: Date.now()
      })
    }
  }

  /**
   * メモリリークの報告
   */
  private reportLeak(leak: MemoryLeak): void {
    this.detectedLeaks.push(leak)
    console.warn(`🔍 Memory leak detected:`, leak)
    
    // 最新50件のみ保持
    if (this.detectedLeaks.length > 50) {
      this.detectedLeaks.shift()
    }
  }

  /**
   * 自動クリーンアップの実行
   */
  private performAutoCleanup(): void {
    // Dead WeakRefの削除
    this.cleanupWeakReferences()
    
    // 期限切れタイマーの削除
    const currentTime = Date.now()
    const expiredTimers = new Set<NodeJS.Timeout>()
    
    for (const timer of this.timers) {
      // タイマーの状態確認（実装依存）
      if ((timer as any)._destroyed || (timer as any)._idleTimeout === -1) {
        expiredTimers.add(timer)
      }
    }
    
    expiredTimers.forEach(timer => this.timers.delete(timer))
  }

  /**
   * クリーンアップの実行
   */
  triggerCleanup(reason: 'warning' | 'gc' | 'manual' = 'manual'): void {
    console.log(`🧹 Triggering cleanup (reason: ${reason})`)
    
    // 登録されたクリーンアップコールバックの実行
    for (const [key, cleanup] of this.cleanupCallbacks) {
      try {
        cleanup()
      } catch (error) {
        console.error(`Cleanup error for ${key}:`, error)
      }
    }
    
    // WeakRefのクリーンアップ
    this.cleanupWeakReferences()
    
    console.log('✅ Cleanup completed')
  }

  /**
   * 大容量オブジェクトの最適化
   */
  optimizeLargeObjects<T>(obj: T, compressFunc?: (obj: T) => string): T | string {
    const objString = JSON.stringify(obj)
    const {size} = new Blob([objString])
    
    // 1MB以上のオブジェクトは圧縮を検討
    if (size > 1024 * 1024) {
      console.warn(`Large object detected: ${Math.round(size / 1024 / 1024)}MB`)
      
      if (compressFunc) {
        return compressFunc(obj)
      }
      
      // デフォルトの圧縮（JSONの最小化）
      return JSON.stringify(obj) as T
    }
    
    return obj
  }

  /**
   * メモリ効率的な配列操作
   */
  createChunkedArray<T>(items: T[], chunkSize: number = 1000): T[][] {
    const chunks: T[][] = []
    
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize))
    }
    
    return chunks
  }

  /**
   * メモリ効率的なイテレーター
   */
  async *createMemoryEfficientIterator<T>(
    items: T[], 
    batchSize: number = 100,
    processFunc?: (item: T) => void
  ): AsyncGenerator<T[], void, unknown> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      if (processFunc) {
        batch.forEach(processFunc)
      }
      
      yield batch
      
      // ガベージコレクションの機会を提供
      if (i % (batchSize * 10) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
  }

  /**
   * カスタムクリーンアップコールバックの登録
   */
  registerCleanupCallback(key: string, callback: () => void): void {
    this.cleanupCallbacks.set(key, callback)
  }

  /**
   * クリーンアップコールバックの削除
   */
  unregisterCleanupCallback(key: string): void {
    this.cleanupCallbacks.delete(key)
  }

  /**
   * メモリレポートの生成
   */
  generateMemoryReport(): {
    current: MemoryStats
    history: MemoryStats[]
    leaks: MemoryLeak[]
    tracked: {
      listeners: number
      timers: number
      intervals: number
      observers: number
      weakRefs: number
      cleanupCallbacks: number
    }
    recommendations: string[]
  } {
    const current = this.getMemoryStats()
    const recommendations: string[] = []
    
    if (current.percentage > 80) {
      recommendations.push('メモリ使用量が高い - 不要なデータのクリーンアップを実行')
    }
    
    if (this.listeners.size > 50) {
      recommendations.push('イベントリスナーが多い - 不要なリスナーの削除を検討')
    }
    
    if (this.detectedLeaks.some(leak => leak.severity === 'high')) {
      recommendations.push('重要なメモリリークが検出された - 緊急対応が必要')
    }
    
    return {
      current,
      history: [...this.memoryHistory],
      leaks: [...this.detectedLeaks],
      tracked: {
        listeners: this.listeners.size,
        timers: this.timers.size,
        intervals: this.intervals.size,
        observers: this.observers.size,
        weakRefs: this.weakRefs.size,
        cleanupCallbacks: this.cleanupCallbacks.size
      },
      recommendations
    }
  }

  /**
   * 完全なクリーンアップ
   */
  cleanup(): void {
    // 監視停止
    this.stopMonitoring()
    
    // 全クリーンアップ実行
    this.triggerCleanup('manual')
    
    // 追跡中のリソースを強制クリーンアップ
    this.timers.forEach(timer => clearTimeout(timer))
    this.intervals.forEach(interval => clearInterval(interval))
    this.observers.forEach(observer => observer.disconnect())
    
    // データ構造のクリア
    this.listeners.clear()
    this.timers.clear()
    this.intervals.clear()
    this.observers.clear()
    this.weakRefs.clear()
    this.cleanupCallbacks.clear()
    this.memoryHistory = []
    this.detectedLeaks = []
    
    console.log('🧠 Memory optimizer cleanup completed')
  }
}

// シングルトンインスタンス
let memoryOptimizerInstance: MemoryOptimizer | null = null

export function getMemoryOptimizer(config?: Partial<MemoryConfig>): MemoryOptimizer {
  if (!memoryOptimizerInstance) {
    memoryOptimizerInstance = new MemoryOptimizer(config)
  }
  return memoryOptimizerInstance
}

export function cleanupMemoryOptimizer(): void {
  if (memoryOptimizerInstance) {
    memoryOptimizerInstance.cleanup()
    memoryOptimizerInstance = null
  }
}

// React Hook
export function useMemoryOptimizer(autoStart: boolean = true) {
  const optimizer = getMemoryOptimizer()
  
  if (autoStart && typeof window !== 'undefined') {
    optimizer.startMonitoring()
  }
  
  return optimizer
}