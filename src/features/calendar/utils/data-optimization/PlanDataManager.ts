/**
 * PlanDataManager - 大量のプランデータを効率的に管理
 * 正規化、インデックス化、クエリ最適化を提供
 */

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

// 正規化されたプランデータ
interface NormalizedPlan {
  id: string
  title: string
  startTime: number // Unix timestamp
  endTime: number // Unix timestamp
  dateKey: string // YYYY-MM-DD format
  color?: string
  location?: string
  description?: string
  tags?: string[]
  recurrenceId?: string
}

// インデックス構造
interface PlanIndexes {
  byDate: Map<string, Set<string>> // date -> plan IDs
  byMonth: Map<string, Set<string>> // YYYY-MM -> plan IDs
  byYear: Map<string, Set<string>> // YYYY -> plan IDs
  byTimeRange: Map<string, Set<string>> // hour range -> plan IDs
  byTag: Map<string, Set<string>> // tag -> plan IDs
  byRecurrence: Map<string, Set<string>> // recurrence ID -> plan IDs
}

// クエリ結果のキャッシュ
interface QueryCache {
  key: string
  result: NormalizedPlan[]
  timestamp: number
  expiry: number
}

export class PlanDataManager {
  private plans: Map<string, NormalizedPlan> = new Map()
  private indexes: PlanIndexes = {
    byDate: new Map(),
    byMonth: new Map(),
    byYear: new Map(),
    byTimeRange: new Map(),
    byTag: new Map(),
    byRecurrence: new Map(),
  }
  private queryCache: Map<string, QueryCache> = new Map()
  private lastUpdate: number = 0

  // パフォーマンス設定
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5分
  private readonly MAX_CACHE_SIZE = 100
  private readonly CHUNK_SIZE = 1000 // バッチ処理のチャンクサイズ

  /**
   * プランデータを正規化して追加
   */
  addPlans(plans: CalendarPlan[]): void {
    const startTime = performance.now()

    // バッチ処理で大量データを効率的に処理
    for (let i = 0; i < plans.length; i += this.CHUNK_SIZE) {
      const chunk = plans.slice(i, i + this.CHUNK_SIZE)
      this.processPlanChunk(chunk)

      // UI のブロッキングを防ぐため次フレームで処理
      if (i + this.CHUNK_SIZE < plans.length) {
        // 同期処理でも構わないが、必要に応じて非同期化可能
      }
    }

    this.lastUpdate = Date.now()
    this.clearExpiredCache()

    const endTime = performance.now()
    console.log(`PlanDataManager: Added ${plans.length} plans in ${endTime - startTime}ms`)
  }

  /**
   * プランチャンクの処理
   */
  private processPlanChunk(plans: CalendarPlan[]): void {
    for (const plan of plans) {
      if (!plan.startDate) continue

      const normalized = this.normalizePlan(plan)
      this.plans.set(normalized.id, normalized)
      this.updateIndexes(normalized)
    }
  }

  /**
   * プランの正規化
   */
  private normalizePlan(plan: CalendarPlan): NormalizedPlan {
    const startTime = plan.startDate!.getTime()
    const endTime = plan.endDate?.getTime() || startTime + 30 * 60 * 1000 // デフォルト30分
    const dateKey = this.getDateKey(plan.startDate!)

    return {
      id: plan.id,
      title: plan.title,
      startTime,
      endTime,
      dateKey,
      color: plan.color,
      location: plan.location,
      description: plan.description,
      tags: plan.tags || [],
      recurrenceId: plan.recurrenceId,
    }
  }

  /**
   * インデックスの更新
   */
  private updateIndexes(plan: NormalizedPlan): void {
    const { id, dateKey, startTime, tags, recurrenceId } = plan
    const startDate = new Date(startTime)

    // 日付別インデックス
    this.addToIndex(this.indexes.byDate, dateKey, id)

    // 月別インデックス
    const monthKey = dateKey.substring(0, 7) // YYYY-MM
    this.addToIndex(this.indexes.byMonth, monthKey, id)

    // 年別インデックス
    const yearKey = dateKey.substring(0, 4) // YYYY
    this.addToIndex(this.indexes.byYear, yearKey, id)

    // 時間帯別インデックス
    const hourKey = `${startDate.getHours()}`
    this.addToIndex(this.indexes.byTimeRange, hourKey, id)

    // タグ別インデックス
    if (tags) {
      for (const tag of tags) {
        this.addToIndex(this.indexes.byTag, tag, id)
      }
    }

    // 繰り返し別インデックス
    if (recurrenceId) {
      this.addToIndex(this.indexes.byRecurrence, recurrenceId, id)
    }
  }

  /**
   * インデックスへの追加ヘルパー
   */
  private addToIndex(index: Map<string, Set<string>>, key: string, id: string): void {
    if (!index.has(key)) {
      index.set(key, new Set())
    }
    index.get(key)!.add(id)
  }

  /**
   * 日付範囲でプランを取得（最適化済み）
   */
  getPlansByDateRange(startDate: Date, endDate: Date): NormalizedPlan[] {
    const cacheKey = `range:${startDate.toISOString()}:${endDate.toISOString()}`

    // キャッシュチェック
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const _startKey = this.getDateKey(startDate)
    const _endKey = this.getDateKey(endDate)
    const planIds = new Set<string>()

    // 日付範囲をイテレート
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateKey = this.getDateKey(currentDate)
      const dayPlans = this.indexes.byDate.get(dateKey)

      if (dayPlans) {
        for (const id of dayPlans) {
          planIds.add(id)
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    const result = Array.from(planIds)
      .map((id) => this.plans.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * 特定の日のプランを取得
   */
  getPlansByDate(date: Date): NormalizedPlan[] {
    const dateKey = this.getDateKey(date)
    const cacheKey = `date:${dateKey}`

    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const planIds = this.indexes.byDate.get(dateKey) || new Set()
    const result = Array.from(planIds)
      .map((id) => this.plans.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * 時間範囲でフィルタ（表示最適化用）
   */
  getPlansByTimeRange(startHour: number, endHour: number, date?: Date): NormalizedPlan[] {
    const cacheKey = `time:${startHour}:${endHour}:${date?.toISOString() || 'all'}`

    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    let plans: NormalizedPlan[]

    if (date) {
      plans = this.getPlansByDate(date)
    } else {
      plans = Array.from(this.plans.values())
    }

    const _startTime = startHour * 60 * 60 * 1000 // ミリ秒
    const _endTime = endHour * 60 * 60 * 1000

    const result = plans.filter((plan) => {
      const planHour = new Date(plan.startTime).getHours()
      return planHour >= startHour && planHour < endHour
    })

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * タグでフィルタ
   */
  getPlansByTag(tag: string): NormalizedPlan[] {
    const cacheKey = `tag:${tag}`

    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const planIds = this.indexes.byTag.get(tag) || new Set()
    const result = Array.from(planIds)
      .map((id) => this.plans.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * 検索機能（インデックス活用）
   */
  searchPlans(query: string): NormalizedPlan[] {
    const cacheKey = `search:${query.toLowerCase()}`

    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const lowerQuery = query.toLowerCase()
    const result = Array.from(this.plans.values())
      .filter(
        (plan) =>
          plan.title.toLowerCase().includes(lowerQuery) ||
          plan.description?.toLowerCase().includes(lowerQuery) ||
          plan.location?.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * プランの更新
   */
  updatePlan(plan: CalendarPlan): void {
    if (!plan.startDate) return

    const normalized = this.normalizePlan(plan)
    const oldPlan = this.plans.get(normalized.id)

    // 古いインデックスエントリを削除
    if (oldPlan) {
      this.removeFromIndexes(oldPlan)
    }

    // 新しいデータで更新
    this.plans.set(normalized.id, normalized)
    this.updateIndexes(normalized)

    this.lastUpdate = Date.now()
    this.clearRelatedCache(normalized.id)
  }

  /**
   * プランの削除
   */
  removePlan(planId: string): void {
    const plan = this.plans.get(planId)
    if (!plan) return

    this.removeFromIndexes(plan)
    this.plans.delete(planId)

    this.lastUpdate = Date.now()
    this.clearRelatedCache(planId)
  }

  /**
   * インデックスからの削除
   */
  private removeFromIndexes(plan: NormalizedPlan): void {
    const { id, dateKey, startTime, tags, recurrenceId } = plan
    const startDate = new Date(startTime)

    this.removeFromIndex(this.indexes.byDate, dateKey, id)
    this.removeFromIndex(this.indexes.byMonth, dateKey.substring(0, 7), id)
    this.removeFromIndex(this.indexes.byYear, dateKey.substring(0, 4), id)
    this.removeFromIndex(this.indexes.byTimeRange, `${startDate.getHours()}`, id)

    if (tags) {
      for (const tag of tags) {
        this.removeFromIndex(this.indexes.byTag, tag, id)
      }
    }

    if (recurrenceId) {
      this.removeFromIndex(this.indexes.byRecurrence, recurrenceId, id)
    }
  }

  /**
   * インデックスからの削除ヘルパー
   */
  private removeFromIndex(index: Map<string, Set<string>>, key: string, id: string): void {
    const set = index.get(key)
    if (set) {
      set.delete(id)
      if (set.size === 0) {
        index.delete(key)
      }
    }
  }

  /**
   * キャッシュ関連メソッド
   */
  private getFromCache(key: string): NormalizedPlan[] | null {
    const cached = this.queryCache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.queryCache.delete(key)
      return null
    }

    return cached.result
  }

  private setCache(key: string, result: NormalizedPlan[]): void {
    if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
      // LRU 的にキャッシュクリア
      const oldestKey = Array.from(this.queryCache.keys())[0]
      this.queryCache.delete(oldestKey)
    }

    this.queryCache.set(key, {
      key,
      result: [...result], // 配列をコピー
      timestamp: Date.now(),
      expiry: Date.now() + this.CACHE_TTL,
    })
  }

  private clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, cache] of this.queryCache.entries()) {
      if (now > cache.expiry) {
        this.queryCache.delete(key)
      }
    }
  }

  private clearRelatedCache(_planId: string): void {
    // 関連するキャッシュをクリア
    this.queryCache.clear() // 簡単のため全クリア
  }

  /**
   * ユーティリティメソッド
   */
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  /**
   * 統計情報の取得
   */
  getStats() {
    return {
      totalPlans: this.plans.size,
      cacheSize: this.queryCache.size,
      indexSizes: {
        byDate: this.indexes.byDate.size,
        byMonth: this.indexes.byMonth.size,
        byYear: this.indexes.byYear.size,
        byTimeRange: this.indexes.byTimeRange.size,
        byTag: this.indexes.byTag.size,
        byRecurrence: this.indexes.byRecurrence.size,
      },
      lastUpdate: this.lastUpdate,
      memoryUsage: this.estimateMemoryUsage(),
    }
  }

  /**
   * メモリ使用量の推定
   */
  private estimateMemoryUsage(): number {
    // 簡易的なメモリ使用量推定
    const planSize = this.plans.size * 500 // 平均500バイト/プラン
    const indexSize = Object.values(this.indexes).reduce((total, index) => total + index.size * 100, 0) // 平均100バイト/インデックスエントリ
    const cacheSize = this.queryCache.size * 1000 // 平均1KB/キャッシュエントリ

    return planSize + indexSize + cacheSize
  }

  /**
   * すべてのデータをクリア
   */
  clear(): void {
    this.plans.clear()
    Object.values(this.indexes).forEach((index) => index.clear())
    this.queryCache.clear()
    this.lastUpdate = Date.now()
  }
}
