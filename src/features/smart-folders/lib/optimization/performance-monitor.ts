/**
 * パフォーマンスモニタリング
 */

import { AdvancedCacheManager } from './cache-manager'
import { QueryOptimizer } from './query-optimizer'

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
