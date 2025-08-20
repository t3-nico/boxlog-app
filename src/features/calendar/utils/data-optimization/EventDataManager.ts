/**
 * EventDataManager - 大量のイベントデータを効率的に管理
 * 正規化、インデックス化、クエリ最適化を提供
 */

import type { CalendarEvent } from '@/features/events'

// 正規化されたイベントデータ
interface NormalizedEvent {
  id: string
  title: string
  startTime: number // Unix timestamp
  endTime: number   // Unix timestamp
  dateKey: string   // YYYY-MM-DD format
  color?: string
  location?: string
  description?: string
  tags?: string[]
  recurrenceId?: string
}

// インデックス構造
interface EventIndexes {
  byDate: Map<string, Set<string>> // date -> event IDs
  byMonth: Map<string, Set<string>> // YYYY-MM -> event IDs
  byYear: Map<string, Set<string>>  // YYYY -> event IDs
  byTimeRange: Map<string, Set<string>> // hour range -> event IDs
  byTag: Map<string, Set<string>>   // tag -> event IDs
  byRecurrence: Map<string, Set<string>> // recurrence ID -> event IDs
}

// クエリ結果のキャッシュ
interface QueryCache {
  key: string
  result: NormalizedEvent[]
  timestamp: number
  expiry: number
}

export class EventDataManager {
  private events: Map<string, NormalizedEvent> = new Map()
  private indexes: EventIndexes = {
    byDate: new Map(),
    byMonth: new Map(),
    byYear: new Map(),
    byTimeRange: new Map(),
    byTag: new Map(),
    byRecurrence: new Map()
  }
  private queryCache: Map<string, QueryCache> = new Map()
  private lastUpdate: number = 0
  
  // パフォーマンス設定
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5分
  private readonly MAX_CACHE_SIZE = 100
  private readonly CHUNK_SIZE = 1000 // バッチ処理のチャンクサイズ

  /**
   * イベントデータを正規化して追加
   */
  addEvents(events: CalendarEvent[]): void {
    const startTime = performance.now()
    
    // バッチ処理で大量データを効率的に処理
    for (let i = 0; i < events.length; i += this.CHUNK_SIZE) {
      const chunk = events.slice(i, i + this.CHUNK_SIZE)
      this.processEventChunk(chunk)
      
      // UI のブロッキングを防ぐため次フレームで処理
      if (i + this.CHUNK_SIZE < events.length) {
        // 同期処理でも構わないが、必要に応じて非同期化可能
      }
    }
    
    this.lastUpdate = Date.now()
    this.clearExpiredCache()
    
    const endTime = performance.now()
    console.log(`EventDataManager: Added ${events.length} events in ${endTime - startTime}ms`)
  }

  /**
   * イベントチャンクの処理
   */
  private processEventChunk(events: CalendarEvent[]): void {
    for (const event of events) {
      if (!event.startDate) continue
      
      const normalized = this.normalizeEvent(event)
      this.events.set(normalized.id, normalized)
      this.updateIndexes(normalized)
    }
  }

  /**
   * イベントの正規化
   */
  private normalizeEvent(event: CalendarEvent): NormalizedEvent {
    const startTime = event.startDate!.getTime()
    const endTime = event.endDate?.getTime() || startTime + 30 * 60 * 1000 // デフォルト30分
    const dateKey = this.getDateKey(event.startDate!)

    return {
      id: event.id,
      title: event.title,
      startTime,
      endTime,
      dateKey,
      color: event.color,
      location: event.location,
      description: event.description,
      tags: event.tags || [],
      recurrenceId: event.recurrenceId
    }
  }

  /**
   * インデックスの更新
   */
  private updateIndexes(event: NormalizedEvent): void {
    const { id, dateKey, startTime, tags, recurrenceId } = event
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
   * 日付範囲でイベントを取得（最適化済み）
   */
  getEventsByDateRange(startDate: Date, endDate: Date): NormalizedEvent[] {
    const cacheKey = `range:${startDate.toISOString()}:${endDate.toISOString()}`
    
    // キャッシュチェック
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startKey = this.getDateKey(startDate)
    const endKey = this.getDateKey(endDate)
    const eventIds = new Set<string>()

    // 日付範囲をイテレート
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateKey = this.getDateKey(currentDate)
      const dayEvents = this.indexes.byDate.get(dateKey)
      
      if (dayEvents) {
        for (const id of dayEvents) {
          eventIds.add(id)
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const result = Array.from(eventIds)
      .map(id => this.events.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * 特定の日のイベントを取得
   */
  getEventsByDate(date: Date): NormalizedEvent[] {
    const dateKey = this.getDateKey(date)
    const cacheKey = `date:${dateKey}`
    
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const eventIds = this.indexes.byDate.get(dateKey) || new Set()
    const result = Array.from(eventIds)
      .map(id => this.events.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * 時間範囲でフィルタ（表示最適化用）
   */
  getEventsByTimeRange(startHour: number, endHour: number, date?: Date): NormalizedEvent[] {
    const cacheKey = `time:${startHour}:${endHour}:${date?.toISOString() || 'all'}`
    
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    let events: NormalizedEvent[]
    
    if (date) {
      events = this.getEventsByDate(date)
    } else {
      events = Array.from(this.events.values())
    }

    const startTime = startHour * 60 * 60 * 1000 // ミリ秒
    const endTime = endHour * 60 * 60 * 1000

    const result = events.filter(event => {
      const eventHour = new Date(event.startTime).getHours()
      return eventHour >= startHour && eventHour < endHour
    })

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * タグでフィルタ
   */
  getEventsByTag(tag: string): NormalizedEvent[] {
    const cacheKey = `tag:${tag}`
    
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const eventIds = this.indexes.byTag.get(tag) || new Set()
    const result = Array.from(eventIds)
      .map(id => this.events.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * 検索機能（インデックス活用）
   */
  searchEvents(query: string): NormalizedEvent[] {
    const cacheKey = `search:${query.toLowerCase()}`
    
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const lowerQuery = query.toLowerCase()
    const result = Array.from(this.events.values())
      .filter(event => 
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => a.startTime - b.startTime)

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * イベントの更新
   */
  updateEvent(event: CalendarEvent): void {
    if (!event.startDate) return

    const normalized = this.normalizeEvent(event)
    const oldEvent = this.events.get(normalized.id)
    
    // 古いインデックスエントリを削除
    if (oldEvent) {
      this.removeFromIndexes(oldEvent)
    }
    
    // 新しいデータで更新
    this.events.set(normalized.id, normalized)
    this.updateIndexes(normalized)
    
    this.lastUpdate = Date.now()
    this.clearRelatedCache(normalized.id)
  }

  /**
   * イベントの削除
   */
  removeEvent(eventId: string): void {
    const event = this.events.get(eventId)
    if (!event) return

    this.removeFromIndexes(event)
    this.events.delete(eventId)
    
    this.lastUpdate = Date.now()
    this.clearRelatedCache(eventId)
  }

  /**
   * インデックスからの削除
   */
  private removeFromIndexes(event: NormalizedEvent): void {
    const { id, dateKey, startTime, tags, recurrenceId } = event
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
  private getFromCache(key: string): NormalizedEvent[] | null {
    const cached = this.queryCache.get(key)
    if (!cached) return null
    
    if (Date.now() > cached.expiry) {
      this.queryCache.delete(key)
      return null
    }
    
    return cached.result
  }

  private setCache(key: string, result: NormalizedEvent[]): void {
    if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
      // LRU 的にキャッシュクリア
      const oldestKey = Array.from(this.queryCache.keys())[0]
      this.queryCache.delete(oldestKey)
    }
    
    this.queryCache.set(key, {
      key,
      result: [...result], // 配列をコピー
      timestamp: Date.now(),
      expiry: Date.now() + this.CACHE_TTL
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

  private clearRelatedCache(eventId: string): void {
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
      totalEvents: this.events.size,
      cacheSize: this.queryCache.size,
      indexSizes: {
        byDate: this.indexes.byDate.size,
        byMonth: this.indexes.byMonth.size,
        byYear: this.indexes.byYear.size,
        byTimeRange: this.indexes.byTimeRange.size,
        byTag: this.indexes.byTag.size,
        byRecurrence: this.indexes.byRecurrence.size
      },
      lastUpdate: this.lastUpdate,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * メモリ使用量の推定
   */
  private estimateMemoryUsage(): number {
    // 簡易的なメモリ使用量推定
    const eventSize = this.events.size * 500 // 平均500バイト/イベント
    const indexSize = Object.values(this.indexes)
      .reduce((total, index) => total + index.size * 100, 0) // 平均100バイト/インデックスエントリ
    const cacheSize = this.queryCache.size * 1000 // 平均1KB/キャッシュエントリ
    
    return eventSize + indexSize + cacheSize
  }

  /**
   * すべてのデータをクリア
   */
  clear(): void {
    this.events.clear()
    Object.values(this.indexes).forEach(index => index.clear())
    this.queryCache.clear()
    this.lastUpdate = Date.now()
  }
}