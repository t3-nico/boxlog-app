/**
 * PerformanceMonitor - カレンダーアプリ専用のパフォーマンス監視システム
 * Web Vitals、メモリ使用量、レンダリング性能を包括的に監視
 */

// パフォーマンスメトリクス の型定義
interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte

  // カスタムメトリクス
  initialLoadTime: number
  timeToInteractive: number
  eventRenderTime: number
  scrollPerformance: number[]
  memoryUsage: MemoryInfo
  
  // カレンダー固有のメトリクス
  calendarMetrics: {
    eventCount: number
    visibleEventCount: number
    renderDuration: number
    dataSyncTime: number
    cacheHitRate: number
  }
}

interface MemoryInfo {
  used: number
  total: number
  percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface PerformanceThreshold {
  lcp: number // 2.5秒
  fid: number // 100ms
  cls: number // 0.1
  initialLoad: number // 1秒
  timeToInteractive: number // 2秒
  memoryUsage: number // 100MB
}

// デフォルトの閾値設定
const DEFAULT_THRESHOLDS: PerformanceThreshold = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  initialLoad: 1000,
  timeToInteractive: 2000,
  memoryUsage: 100 * 1024 * 1024 // 100MB
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {
    scrollPerformance: [],
    calendarMetrics: {
      eventCount: 0,
      visibleEventCount: 0,
      renderDuration: 0,
      dataSyncTime: 0,
      cacheHitRate: 0
    }
  }
  
  private observers: PerformanceObserver[] = []
  private memoryCheckInterval: NodeJS.Timeout | null = null
  private thresholds: PerformanceThreshold = DEFAULT_THRESHOLDS
  private callbacks: Map<string, Function[]> = new Map()
  private isMonitoring = false

  // メトリクス収集履歴（最新100件）
  private metricsHistory: Partial<PerformanceMetrics>[] = []
  private readonly HISTORY_LIMIT = 100

  constructor(customThresholds?: Partial<PerformanceThreshold>) {
    if (customThresholds) {
      this.thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds }
    }
  }

  /**
   * パフォーマンス監視を開始
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.setupWebVitalsObservers()
    this.setupMemoryMonitoring()
    this.setupNavigationTiming()
    this.measureInitialLoad()

    console.log('📊 Performance monitoring started')
  }

  /**
   * パフォーマンス監視を停止
   */
  stopMonitoring(): void {
    this.isMonitoring = false
    
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = null
    }

    console.log('📊 Performance monitoring stopped')
  }

  /**
   * Web Vitals の監視設定
   */
  private setupWebVitalsObservers(): void {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry
      this.updateMetric('lcp', lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.push(lcpObserver)

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        // PerformanceEventTiming interface for first-input entries
        const eventEntry = entry as PerformanceEventTiming
        this.updateMetric('fid', eventEntry.processingStart - eventEntry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.push(fidObserver)

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      const entries = list.getEntries()
      entries.forEach((entry) => {
        // LayoutShift interface for layout-shift entries
        const layoutEntry = entry as LayoutShift
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value
        }
      })
      this.updateMetric('cls', clsValue)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.push(clsObserver)

    // Paint timing
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.updateMetric('fcp', entry.startTime)
        }
      })
    })
    paintObserver.observe({ entryTypes: ['paint'] })
    this.observers.push(paintObserver)
  }

  /**
   * メモリ使用量の監視
   */
  private setupMemoryMonitoring(): void {
    const checkMemory = () => {
      if (!this.isMonitoring) return

      const memoryInfo = this.getMemoryInfo()
      this.updateMetric('memoryUsage', memoryInfo)

      // メモリ使用量が閾値を超えた場合の警告
      if (memoryInfo.used > this.thresholds.memoryUsage) {
        this.triggerCallback('memoryWarning', {
          current: memoryInfo.used,
          threshold: this.thresholds.memoryUsage,
          percentage: memoryInfo.percentage
        })
      }
    }

    checkMemory() // 初回実行
    this.memoryCheckInterval = setInterval(checkMemory, 5000) // 5秒間隔
  }

  /**
   * ナビゲーションタイミングの設定
   */
  private setupNavigationTiming(): void {
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        // PerformanceNavigationTiming interface for navigation entries
        const navEntry = entry as PerformanceNavigationTiming

        // Time to First Byte
        const ttfb = navEntry.responseStart - navEntry.requestStart
        this.updateMetric('ttfb', ttfb)

        // Page Load Time
        const loadTime = navEntry.loadEventEnd - navEntry.navigationStart
        if (loadTime > 0) {
          this.updateMetric('initialLoadTime', loadTime)
        }
      })
    })
    navigationObserver.observe({ entryTypes: ['navigation'] })
    this.observers.push(navigationObserver)
  }

  /**
   * 初期読み込み時間の測定
   */
  private measureInitialLoad(): void {
    const startTime = performance.now()
    
    // DOM読み込み完了時の測定
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const domLoadTime = performance.now() - startTime
        this.updateMetric('initialLoadTime', domLoadTime)
      })
    }

    // すべてのリソース読み込み完了時の測定
    window.addEventListener('load', () => {
      const fullLoadTime = performance.now() - startTime
      this.updateMetric('timeToInteractive', fullLoadTime)
    })
  }

  /**
   * カレンダー固有のメトリクス測定
   */
  measureCalendarRender(eventCount: number, visibleCount: number): void {
    const startTime = performance.now()
    
    // 次のフレームで測定完了
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime
      
      this.updateCalendarMetric('eventCount', eventCount)
      this.updateCalendarMetric('visibleEventCount', visibleCount)
      this.updateCalendarMetric('renderDuration', renderTime)
    })
  }

  /**
   * スクロールパフォーマンスの測定
   */
  measureScrollPerformance(): () => void {
    const scrollTimes: number[] = []
    let isScrolling = false
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true
        scrollTimes.push(performance.now())
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isScrolling = false
        const endTime = performance.now()
        const duration = endTime - scrollTimes[scrollTimes.length - 1]
        
        this.metrics.scrollPerformance!.push(duration)
        
        // 最新50件のみ保持
        if (this.metrics.scrollPerformance!.length > 50) {
          this.metrics.scrollPerformance!.shift()
        }
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // クリーンアップ関数を返す
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }

  /**
   * データ同期時間の測定
   */
  measureDataSync<T>(asyncOperation: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    
    return asyncOperation().then(result => {
      const syncTime = performance.now() - startTime
      this.updateCalendarMetric('dataSyncTime', syncTime)
      return result
    })
  }

  /**
   * キャッシュヒット率の更新
   */
  updateCacheHitRate(hits: number, total: number): void {
    const hitRate = total > 0 ? (hits / total) * 100 : 0
    this.updateCalendarMetric('cacheHitRate', hitRate)
  }

  /**
   * メトリクス値の更新
   */
  private updateMetric(key: keyof PerformanceMetrics, value: number | MemoryInfo): void {
    ;(this.metrics as Record<string, unknown>)[key] = value

    // 履歴に追加
    this.addToHistory()

    // 閾値チェック（数値の場合のみ）
    if (typeof value === 'number') {
      this.checkThresholds(key, value)
    }
  }

  /**
   * カレンダーメトリクスの更新
   */
  private updateCalendarMetric(key: keyof PerformanceMetrics['calendarMetrics'], value: number): void {
    if (!this.metrics.calendarMetrics) {
      this.metrics.calendarMetrics = {
        eventCount: 0,
        visibleEventCount: 0,
        renderDuration: 0,
        dataSyncTime: 0,
        cacheHitRate: 0
      }
    }
    
    this.metrics.calendarMetrics[key as keyof typeof calendarMetrics as keyof typeof calendarMetrics] = value
    this.addToHistory()
  }

  /**
   * 履歴への追加
   */
  private addToHistory(): void {
    this.metricsHistory.push({ ...this.metrics })
    
    if (this.metricsHistory.length > this.HISTORY_LIMIT) {
      this.metricsHistory.shift()
    }
  }

  /**
   * 閾値チェック
   */
  private checkThresholds(key: string, value: number): void {
    const thresholdKey = key as keyof PerformanceThreshold
    const threshold = this.thresholds[thresholdKey as keyof typeof thresholds]
    
    if (threshold && value > threshold) {
      this.triggerCallback('thresholdExceeded', {
        metric: key,
        value,
        threshold,
        severity: this.getSeverity(value, threshold)
      })
    }
  }

  /**
   * 深刻度の判定
   */
  private getSeverity(value: number, threshold: number): 'warning' | 'critical' {
    return value > threshold * 1.5 ? 'critical' : 'warning'
  }

  /**
   * メモリ情報の取得
   */
  private getMemoryInfo(): MemoryInfo {
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
    
    if (memory) {
      const used = memory.usedJSHeapSize
      const total = memory.totalJSHeapSize
      const percentage = (used / total) * 100
      
      // トレンドの判定（簡易実装）
      const previousUsage = this.metrics.memoryUsage?.used || 0
      let trend: MemoryInfo['trend'] = 'stable'
      
      if (used > previousUsage * 1.1) trend = 'increasing'
      else if (used < previousUsage * 0.9) trend = 'decreasing'
      
      return { used, total, percentage, trend }
    }
    
    return { used: 0, total: 0, percentage: 0, trend: 'stable' }
  }

  /**
   * コールバックの登録
   */
  onMetric(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  /**
   * コールバックの実行
   */
  private triggerCallback(event: string, data: unknown): void {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  /**
   * 現在のメトリクス取得
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  /**
   * メトリクス履歴の取得
   */
  getHistory(): Partial<PerformanceMetrics>[] {
    return [...this.metricsHistory]
  }

  /**
   * パフォーマンスレポートの生成
   */
  generateReport(): {
    summary: Record<string, unknown>
    issues: string[]
    recommendations: string[]
    score: number
  } {
    const {metrics} = this
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Web Vitals チェック
    if (metrics.lcp && metrics.lcp > this.thresholds.lcp) {
      issues.push(`LCP が遅い: ${Math.round(metrics.lcp)}ms`)
      recommendations.push('画像の最適化、フォントの事前読み込みを検討')
      score -= 20
    }

    if (metrics.fid && metrics.fid > this.thresholds.fid) {
      issues.push(`FID が遅い: ${Math.round(metrics.fid)}ms`)
      recommendations.push('JavaScript の実行時間を最適化')
      score -= 15
    }

    if (metrics.cls && metrics.cls > this.thresholds.cls) {
      issues.push(`CLS が高い: ${metrics.cls.toFixed(3)}`)
      recommendations.push('レイアウトシフトの原因を特定・修正')
      score -= 15
    }

    // メモリ使用量チェック
    if (metrics.memoryUsage && metrics.memoryUsage.used > this.thresholds.memoryUsage) {
      issues.push(`メモリ使用量が多い: ${Math.round(metrics.memoryUsage.used / 1024 / 1024)}MB`)
      recommendations.push('メモリリークの確認、不要なデータのクリーンアップ')
      score -= 25
    }

    // カレンダー固有の問題
    if (metrics.calendarMetrics?.renderDuration && metrics.calendarMetrics.renderDuration > 16) {
      issues.push('レンダリングが重い（フレーム落ち発生）')
      recommendations.push('仮想化、メモ化の強化を検討')
      score -= 10
    }

    return {
      summary: {
        webVitals: {
          lcp: metrics.lcp,
          fid: metrics.fid,
          cls: metrics.cls
        },
        customMetrics: {
          initialLoadTime: metrics.initialLoadTime,
          timeToInteractive: metrics.timeToInteractive,
          memoryUsage: metrics.memoryUsage
        },
        calendarMetrics: metrics.calendarMetrics
      },
      issues,
      recommendations,
      score: Math.max(0, score)
    }
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup(): void {
    this.stopMonitoring()
    this.callbacks.clear()
    this.metricsHistory = []
    this.metrics = {
      scrollPerformance: [],
      calendarMetrics: {
        eventCount: 0,
        visibleEventCount: 0,
        renderDuration: 0,
        dataSyncTime: 0,
        cacheHitRate: 0
      }
    }
  }
}

// シングルトンインスタンス
let performanceMonitorInstance: PerformanceMonitor | null = null

export function getPerformanceMonitor(thresholds?: Partial<PerformanceThreshold>): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor(thresholds)
  }
  return performanceMonitorInstance
}

export function cleanupPerformanceMonitor(): void {
  if (performanceMonitorInstance) {
    performanceMonitorInstance.cleanup()
    performanceMonitorInstance = null
  }
}

// React Hook での使用
export function usePerformanceMonitor(autoStart: boolean = true) {
  const monitor = getPerformanceMonitor()
  
  if (autoStart && typeof window !== 'undefined') {
    monitor.startMonitoring()
  }
  
  return monitor
}