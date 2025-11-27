/**
 * Speed Insights & Core Web Vitals 測定システム
 * パフォーマンス監視・最適化・レポート生成
 */

// TODO(#389): web-vitals v4 changed to onINP instead of onFID
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

import { trackPerformance } from './vercel-analytics'

/**
 * Core Web Vitals 測定結果
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  timestamp: number
}

/**
 * パフォーマンス閾値設定
 */
export const PERFORMANCE_THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500, // 2.5秒以下
    poor: 4000, // 4秒以上
  },
  // First Input Delay (FID)
  FID: {
    good: 100, // 100ms以下
    poor: 300, // 300ms以上
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1, // 0.1以下
    poor: 0.25, // 0.25以上
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800, // 1.8秒以下
    poor: 3000, // 3秒以上
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800, // 800ms以下
    poor: 1800, // 1.8秒以上
  },
} as const

/**
 * パフォーマンス設定
 */
export interface SpeedInsightsConfig {
  enabled: boolean
  sampleRate: number
  reportThreshold: 'good' | 'needs-improvement' | 'poor'
  autoReport: boolean
  debug: boolean
}

/**
 * デフォルト設定
 */
const DEFAULT_SPEED_CONFIG: SpeedInsightsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 0.1, // 10%のユーザーを測定
  reportThreshold: 'needs-improvement', // 改善が必要以上のみレポート
  autoReport: true,
  debug: process.env.NODE_ENV === 'development',
}

/**
 * Speed Insights管理クラス
 */
export class SpeedInsightsManager {
  private config: SpeedInsightsConfig
  private metrics: Map<string, WebVitalsMetric> = new Map()
  private isInitialized = false

  constructor(config: Partial<SpeedInsightsConfig> = {}) {
    this.config = { ...DEFAULT_SPEED_CONFIG, ...config }
  }

  /**
   * Speed Insights初期化
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('⚡ Speed Insights disabled')
      }
      return
    }

    // サンプリング
    if (Math.random() > this.config.sampleRate) {
      if (this.config.debug) {
        console.log('⚡ Speed Insights: User not in sample')
      }
      return
    }

    this.startMeasuring()
    this.isInitialized = true

    if (this.config.debug) {
      console.log('⚡ Speed Insights initialized', this.config)
    }
  }

  /**
   * Core Web Vitals測定開始
   */
  private startMeasuring(): void {
    // Largest Contentful Paint
    onLCP((metric: any) => {
      this.recordMetric({
        name: 'LCP',
        value: metric.value,
        rating: this.getRating('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      })
    })

    // Interaction to Next Paint (replaced FID in web-vitals v4)
    onINP((metric: any) => {
      this.recordMetric({
        name: 'FID', // Keep name as FID for backward compatibility
        value: metric.value,
        rating: this.getRating('FID', metric.value),
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      })
    })

    // Cumulative Layout Shift
    onCLS((metric: any) => {
      this.recordMetric({
        name: 'CLS',
        value: metric.value,
        rating: this.getRating('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      })
    })

    // First Contentful Paint
    onFCP((metric: any) => {
      this.recordMetric({
        name: 'FCP',
        value: metric.value,
        rating: this.getRating('FCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      })
    })

    // Time to First Byte
    onTTFB((metric: any) => {
      this.recordMetric({
        name: 'TTFB',
        value: metric.value,
        rating: this.getRating('TTFB', metric.value),
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      })
    })
  }

  /**
   * メトリクスを記録
   */
  private recordMetric(metric: WebVitalsMetric): void {
    this.metrics.set(metric.name, metric)

    if (this.config.debug) {
      console.log(`⚡ ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        threshold: PERFORMANCE_THRESHOLDS[metric.name],
      })
    }

    // 自動レポート
    if (this.config.autoReport && this.shouldReport(metric)) {
      this.reportMetric(metric)
    }
  }

  /**
   * レポートすべきかチェック
   */
  private shouldReport(metric: WebVitalsMetric): boolean {
    switch (this.config.reportThreshold) {
      case 'good':
        return true // 全てレポート
      case 'needs-improvement':
        return metric.rating !== 'good' // 良好でないもののみ
      case 'poor':
        return metric.rating === 'poor' // 悪いもののみ
      default:
        return false
    }
  }

  /**
   * メトリクスをレポート
   */
  private reportMetric(metric: WebVitalsMetric): void {
    trackPerformance({
      name: `web_vitals_${metric.name.toLowerCase()}`,
      value: metric.value,
      threshold: this.getThreshold(metric.name, 'good'),
    })

    // カスタムイベントとしても送信
    // TODO(#389): trackEvent関数の実装後に有効化
    // if (typeof trackEvent !== 'undefined') {
    //   try {
    //     ;(window as any).gtag?.('event', 'web_vitals', {
    //       metric_name: metric.name,
    //       metric_value: metric.value,
    //       metric_rating: metric.rating,
    //       custom_map: { metric_value: 'value' },
    //     })
    //   } catch (error) {
    //     if (this.config.debug) {
    //       console.warn('Failed to send web vitals to gtag:', error)
    //     }
    //   }
    // }
  }

  /**
   * レーティングを計算
   */
  private getRating(
    metricName: keyof typeof PERFORMANCE_THRESHOLDS,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[metricName]

    if (value <= thresholds.good) {
      return 'good'
    } else if (value <= thresholds.poor) {
      return 'needs-improvement'
    } else {
      return 'poor'
    }
  }

  /**
   * 閾値を取得
   */
  private getThreshold(metricName: keyof typeof PERFORMANCE_THRESHOLDS, rating: 'good' | 'poor'): number {
    return PERFORMANCE_THRESHOLDS[metricName][rating]
  }

  /**
   * 現在のメトリクスを取得
   */
  getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * パフォーマンスサマリーを取得
   */
  getPerformanceSummary(): {
    overall: 'good' | 'needs-improvement' | 'poor'
    metrics: WebVitalsMetric[]
    recommendations: string[]
  } {
    const metrics = this.getMetrics()

    if (metrics.length === 0) {
      return {
        overall: 'good',
        metrics: [],
        recommendations: ['まだ測定データがありません'],
      }
    }

    // 全体評価を計算
    const poorCount = metrics.filter((m) => m.rating === 'poor').length
    const needsImprovementCount = metrics.filter((m) => m.rating === 'needs-improvement').length

    let overall: 'good' | 'needs-improvement' | 'poor'
    if (poorCount > 0) {
      overall = 'poor'
    } else if (needsImprovementCount > 0) {
      overall = 'needs-improvement'
    } else {
      overall = 'good'
    }

    // 推奨事項を生成
    const recommendations = this.generateRecommendations(metrics)

    return {
      overall,
      metrics,
      recommendations,
    }
  }

  /**
   * 推奨事項を生成
   */
  private generateRecommendations(metrics: WebVitalsMetric[]): string[] {
    const recommendations: string[] = []

    metrics.forEach((metric) => {
      if (metric.rating === 'poor' || metric.rating === 'needs-improvement') {
        switch (metric.name) {
          case 'LCP':
            recommendations.push('画像を最適化し、重要なリソースをプリロードしてください')
            break
          case 'FID':
            recommendations.push('JavaScriptの実行時間を短縮し、長いタスクを分割してください')
            break
          case 'CLS':
            recommendations.push('画像やフォントのサイズを事前に指定してレイアウトシフトを防いでください')
            break
          case 'FCP':
            recommendations.push('重要なCSS/JSを最適化し、レンダリングブロッキングを削減してください')
            break
          case 'TTFB':
            recommendations.push('サーバー応答時間を改善し、CDNの利用を検討してください')
            break
        }
      }
    })

    return recommendations.length > 0 ? recommendations : ['パフォーマンスは良好です']
  }

  /**
   * 設定を更新
   */
  updateConfig(newConfig: Partial<SpeedInsightsConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * メトリクスをリセット
   */
  resetMetrics(): void {
    this.metrics.clear()
  }
}

/**
 * グローバルSpeed Insightsインスタンス
 */
export const speedInsights = new SpeedInsightsManager()

/**
 * Speed Insights初期化
 */
export function initializeSpeedInsights(config?: Partial<SpeedInsightsConfig>): void {
  if (config) {
    speedInsights.updateConfig(config)
  }
  speedInsights.initialize()
}

/**
 * 手動でのパフォーマンス測定
 */
export function measureCustomPerformance(name: string, startTime: number): void {
  const duration = performance.now() - startTime

  trackPerformance({
    name: `custom_${name}`,
    value: duration,
    threshold: 1000, // 1秒をデフォルト閾値とする
  })
}

/**
 * ページ読み込み時間を測定
 */
export function measurePageLoad(): void {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (perfData) {
      const pageLoadTime = perfData.loadEventEnd - perfData.startTime

      trackPerformance({
        name: 'page_load_time',
        value: pageLoadTime,
        threshold: 3000, // 3秒
      })
    }
  })
}

/**
 * API応答時間を測定
 */
export function measureApiResponse(url: string, startTime: number): void {
  const duration = performance.now() - startTime

  trackPerformance({
    name: 'api_response_time',
    value: duration,
    threshold: 2000, // 2秒
  })
}

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return {
      measureStartTime: () => 0,
      measureEnd: () => {},
      getMetrics: () => [],
      getSummary: () => ({ overall: 'good' as const, metrics: [], recommendations: [] }),
    }
  }

  return {
    measureStartTime: () => performance.now(),

    measureEnd: (name: string, startTime: number) => {
      measureCustomPerformance(name, startTime)
    },

    getMetrics: () => speedInsights.getMetrics(),

    getSummary: () => speedInsights.getPerformanceSummary(),
  }
}

/**
 * パフォーマンス監視の自動セットアップ
 */
export function setupPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return

  // ページ読み込み測定
  measurePageLoad()

  // ブラウザサポートチェック
  if ('PerformanceObserver' in window) {
    // Long Task の監視
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            // 50ms以上のタスクを記録
            trackPerformance({
              name: 'long_task',
              value: entry.duration,
              threshold: 50,
            })
          }
        })
      })
      observer.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long task monitoring not supported:', error)
    }

    // Resource timing の監視
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resource = entry as PerformanceResourceTiming
          if (resource.duration > 1000) {
            // 1秒以上のリソース読み込みを記録
            trackPerformance({
              name: 'slow_resource',
              value: resource.duration,
              threshold: 1000,
            })
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Resource timing monitoring not supported:', error)
    }
  }
}
