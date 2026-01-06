'use client';

// パフォーマンス計測のため、useMemo内でperformance.now()を呼び出す必要がある
import { useEffect, useMemo, useRef } from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

// メモ化キーの生成
interface MemoizationKey {
  events: string; // イベント配列のハッシュ
  dateRange: string; // 日付範囲
  filters: string; // フィルター設定
  viewType: string; // 表示タイプ
}

interface MemoizedEventData {
  processedEvents: CalendarPlan[];
  eventsByDate: Map<string, CalendarPlan[]>;
  eventsByHour: Map<number, CalendarPlan[]>;
  totalDuration: number;
  overlappingEvents: CalendarPlan[][];
}

// LRU キャッシュの実装
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // アクセスされたアイテムを最新に移動
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 最も古いアイテムを削除
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// グローバルキャッシュインスタンス
const eventCache = new LRUCache<string, MemoizedEventData>(100);
const computationCache = new LRUCache<string, unknown>(200);

// ハッシュ関数（高速化のため単純な実装）
function fastHash(input: string): string {
  let hash = 0;
  if (input.length === 0) return hash.toString();

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return hash.toString();
}

// イベント配列のハッシュ生成
function generateEventHash(events: CalendarPlan[]): string {
  const eventKeys = events.map((e) => `${e.id}-${e.startDate?.getTime()}-${e.endDate?.getTime()}`);
  return fastHash(eventKeys.join('|'));
}

// メモ化キーの生成
function generateMemoKey(
  events: CalendarPlan[],
  startDate: Date,
  endDate: Date,
  filters: Record<string, unknown>,
  viewType: string,
): string {
  const key: MemoizationKey = {
    events: generateEventHash(events),
    dateRange: `${startDate.getTime()}-${endDate.getTime()}`,
    filters: JSON.stringify(filters),
    viewType,
  };
  return fastHash(JSON.stringify(key));
}

export function useMemoizedPlans(
  events: CalendarPlan[],
  startDate: Date,
  endDate: Date,
  filters: Record<string, unknown> = {},
  viewType: string = 'week',
) {
  const previousKey = useRef<string>('');
  const computationStartTime = useRef<number>(0);

  // メモ化キーの生成
  const memoKey = useMemo(() => {
    return generateMemoKey(events, startDate, endDate, filters, viewType);
  }, [events, startDate, endDate, filters, viewType]);

  // キャッシュされたデータの取得
  const memoizedData = useMemo((): MemoizedEventData => {
    // キャッシュヒットチェック
    const cached = eventCache.get(memoKey);
    if (cached) {
      return cached;
    }

    computationStartTime.current = performance.now();

    // 日付範囲でのフィルタリング
    const filteredEvents = events.filter((event) => {
      if (!event.startDate) return false;

      const eventDate = event.startDate;
      return eventDate >= startDate && eventDate <= endDate;
    });

    // 追加フィルターの適用
    const processedEvents = applyFilters(filteredEvents, filters);

    // 日付別グルーピング
    const eventsByDate = new Map<string, CalendarPlan[]>();
    const eventsByHour = new Map<number, CalendarPlan[]>();
    let totalDuration = 0;

    for (const event of processedEvents) {
      if (!event.startDate) continue;

      // 日付別
      const dateKey = event.startDate.toISOString().split('T')[0]!;
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);

      // 時間別
      const hour = event.startDate.getHours();
      if (!eventsByHour.has(hour)) {
        eventsByHour.set(hour, []);
      }
      eventsByHour.get(hour)!.push(event);

      // 合計時間の計算
      if (event.endDate) {
        totalDuration += event.endDate.getTime() - event.startDate.getTime();
      }
    }

    // 重複イベントの検出
    const overlappingEvents = findOverlappingEvents(processedEvents);

    const result: MemoizedEventData = {
      processedEvents,
      eventsByDate,
      eventsByHour,
      totalDuration,
      overlappingEvents,
    };

    // キャッシュに保存
    eventCache.set(memoKey, result);

    const computationTime = performance.now() - computationStartTime.current;
    if (computationTime > 16) {
      // 1フレーム以上かかった場合は警告
      console.warn(`Heavy computation detected: ${computationTime}ms for ${events.length} events`);
    }

    return result;
  }, [memoKey, events, startDate, endDate, filters]);

  // パフォーマンス監視（キー変更のみトラック）
  useEffect(() => {
    previousKey.current = memoKey;
  }, [memoKey]);

  return memoizedData;
}

// フィルターの適用
function applyFilters(events: CalendarPlan[], filters: Record<string, unknown>): CalendarPlan[] {
  if (!filters || Object.keys(filters).length === 0) {
    return events;
  }

  return events.filter((event) => {
    // タグフィルター
    const filterTags = filters.tags as string[] | undefined;
    if (filterTags && Array.isArray(filterTags) && filterTags.length > 0) {
      if (!event.tags || !event.tags.some((tag) => filterTags.includes(tag.id))) {
        return false;
      }
    }

    // カテゴリーフィルター（categoryプロパティは存在しないためコメントアウト）
    // Note: CalendarPlan型にcategoryプロパティは存在しません
    // 必要であればtypeやtagsでフィルタリングしてください
    // if (filters.category && event.category !== filters.category) {
    //   return false
    // }

    // 時間範囲フィルター
    if (filters.timeRange) {
      if (!event.startDate) return false;
      const hour = event.startDate.getHours();
      const timeRange = filters.timeRange as { start: number; end: number };
      if (hour < timeRange.start || hour > timeRange.end) {
        return false;
      }
    }

    // テキスト検索フィルター
    if (filters.searchQuery && typeof filters.searchQuery === 'string') {
      const query = filters.searchQuery.toLowerCase();
      if (
        !event.title.toLowerCase().includes(query) &&
        !event.description?.toLowerCase().includes(query) &&
        !event.location?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    return true;
  });
}

// 重複イベントの検出
function findOverlappingEvents(events: CalendarPlan[]): CalendarPlan[][] {
  const overlappingGroups: CalendarPlan[][] = [];
  const processedIds = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    const event1 = events[i];
    if (!event1 || processedIds.has(event1.id) || !event1.startDate || !event1.endDate) {
      continue;
    }

    const overlappingGroup = [event1];
    processedIds.add(event1.id);

    for (let j = i + 1; j < events.length; j++) {
      const event2 = events[j];
      if (!event2 || processedIds.has(event2.id) || !event2.startDate || !event2.endDate) {
        continue;
      }

      // 重複チェック
      if (event1.startDate < event2.endDate && event2.startDate < event1.endDate) {
        overlappingGroup.push(event2);
        processedIds.add(event2.id);
      }
    }

    if (overlappingGroup.length > 1) {
      overlappingGroups.push(overlappingGroup);
    }
  }

  return overlappingGroups;
}

// 後方互換性のためのエイリアス
/** @deprecated Use useMemoizedPlans instead */
export const useMemoizedEvents = useMemoizedPlans;

// 計算結果のメモ化用フック
export function useMemoizedComputation<T>(
  computeFunction: () => T,
  dependencies: unknown[],
  cacheKey?: string,
): T {
  const key = cacheKey || fastHash(JSON.stringify(dependencies));

  return useMemo(() => {
    const cached = computationCache.get(key);
    if (cached !== undefined) {
      return cached as T;
    }

    const result = computeFunction();
    computationCache.set(key, result);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, computeFunction, ...dependencies]);
}

// 複雑な計算の非同期メモ化
export function useAsyncMemoizedComputation<T>(
  computeFunction: () => Promise<T>,
  dependencies: unknown[],
  cacheKey?: string,
): { data: T | null; loading: boolean; error: Error | null } {
  const key = cacheKey || fastHash(JSON.stringify(dependencies));

  return useMemo(() => {
    // 同期的な初期値を返し、非同期で更新
    const cached = computationCache.get(key);
    if (cached !== undefined) {
      return { data: cached as T, loading: false, error: null };
    }

    // 非同期計算を開始
    let data: T | null = null;
    let loading = true;
    let error: Error | null = null;

    computeFunction()
      .then((result) => {
        data = result;
        loading = false;
        computationCache.set(key, result);
      })
      .catch((err) => {
        error = err;
        loading = false;
      });

    return { data, loading, error };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, computeFunction, ...dependencies]);
}

// カレンダー専用のメモ化フック
export function useMemoizedCalendarData(
  events: CalendarPlan[],
  viewDate: Date,
  viewType: 'day' | 'week' = 'week',
) {
  const { startDate, endDate } = useMemo(() => {
    const date = new Date(viewDate);

    switch (viewType) {
      case 'day':
        return {
          startDate: new Date(date.setHours(0, 0, 0, 0)),
          endDate: new Date(date.setHours(23, 59, 59, 999)),
        };

      case 'week':
      default: {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // 日曜日開始
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return { startDate: weekStart, endDate: weekEnd };
      }
    }
  }, [viewDate, viewType]);

  return useMemoizedEvents(events, startDate, endDate, {}, viewType);
}

// キャッシュ管理のユーティリティ
export const CacheManager = {
  clearEventCache: () => eventCache.clear(),
  clearComputationCache: () => computationCache.clear(),
  clearAllCaches: () => {
    eventCache.clear();
    computationCache.clear();
  },
  getCacheStats: () => ({
    eventCacheSize: eventCache.size(),
    computationCacheSize: computationCache.size(),
    totalCacheSize: eventCache.size() + computationCache.size(),
  }),
};
