/**
 * 高度なキャッシュ戦略
 */

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
