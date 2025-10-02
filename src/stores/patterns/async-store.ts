/**
 * 非同期ストアパターン
 * API通信やデータフェッチを扱うストアテンプレート
 */
import { createBaseStore, BaseStore } from './base-store'
/**
 * 非同期ストアの状態インターフェース
 */
export interface AsyncState<T> {
  data: T | null
  fetchStatus: 'idle' | 'loading' | 'success' | 'error'
  lastFetch: Date | null
  isValidating: boolean
  mutating: boolean
}
/**
 * 非同期ストアのアクションインターフェース
 */
export interface AsyncActions<T> {
  fetch: (params?: any) => Promise<T | null>
  mutate: (data: Partial<T>, options?: MutateOptions<T>) => Promise<T | null>
  invalidate: () => void
  refresh: () => Promise<T | null>
  setData: (data: T | null) => void
  optimisticUpdate: (updater: (current: T) => T) => void
}
/**
 * ミューテーションオプション
 */
export interface MutateOptions<T> {
  optimistic?: boolean
  rollbackOnError?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}
/**
 * 非同期ストアの設定
 */
export interface AsyncStoreConfig<T> {
  name: string
  fetcher: (params?: any) => Promise<T>
  mutator?: (data: Partial<T>) => Promise<T>
  cacheTime?: number // キャッシュ有効期間（ミリ秒）
  staleTime?: number // データが古いと見なされるまでの時間（ミリ秒）
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  refetchInterval?: number // 定期的な再フェッチ間隔（ミリ秒）
  retry?: number // リトライ回数
  retryDelay?: number // リトライ間隔（ミリ秒）
}
/**
 * 非同期ストアの型定義
 */
export type AsyncStore<T> = BaseStore & AsyncState<T> & AsyncActions<T>
/**
 * 非同期ストアを作成するファクトリー関数
 */
export function createAsyncStore<T>(
  config: AsyncStoreConfig<T>
): UseBoundStore<StoreApi<AsyncStore<T>>> {
  const defaultConfig: Partial<AsyncStoreConfig<T>> = {
    cacheTime: 5 * 60 * 1000, // 5分
    staleTime: 1 * 60 * 1000, // 1分
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000
  }
  const finalConfig = { ...defaultConfig, ...config }
  // 初期状態
  const initialState: AsyncState<T> = {
    data: null,
    fetchStatus: 'idle',
    lastFetch: null,
    isValidating: false,
    mutating: false
  }
  // アクション実装
  const actions = (
    set: (state: any) => void,
    get: () => AsyncStore<T>
  ): AsyncActions<T> => ({
    fetch: async (params?: any) => {
      const state = get()
      // キャッシュチェック
      if (state.data && state.lastFetch && !state.isValidating) {
        const cacheAge = Date.now() - state.lastFetch.getTime()
        if (cacheAge < (finalConfig.staleTime || 0)) {
          return state.data
        }
      }
      set({
        fetchStatus: 'loading',
        isValidating: !!state.data
      })
      // リトライロジック
      let lastError: Error | null = null
      for (let i = 0; i <= (finalConfig.retry || 0); i++) {
        try {
          const data = await finalConfig.fetcher(params)
          set({
            data,
            fetchStatus: 'success',
            lastFetch: new Date(),
            isValidating: false,
            error: null
          })
          return data
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          if (i < (finalConfig.retry || 0)) {
            await new Promise(resolve =>
              setTimeout(resolve, finalConfig.retryDelay || 1000)
            )
          }
        }
      }
      // すべてのリトライが失敗
      set({
        fetchStatus: 'error',
        error: lastError,
        isValidating: false
      })
      return null
    },
    mutate: async (data: Partial<T>, options?: MutateOptions<T>) => {
      const state = get()
      const previousData = state.data
      if (!previousData) {
        throw new Error('No data to mutate')
      }
      set({ mutating: true })
      // 楽観的更新
      if (options?.optimistic) {
        const optimisticData = { ...previousData, ...data }
        set({ data: optimisticData })
      }
      try {
        const newData = finalConfig.mutator
          ? await finalConfig.mutator(data)
          : { ...previousData, ...data } as T
        set({
          data: newData,
          mutating: false,
          lastFetch: new Date()
        })
        options?.onSuccess?.(newData)
        return newData
      } catch (error) {
        // ロールバック
        if (options?.optimistic && options?.rollbackOnError !== false) {
          set({ data: previousData })
        }
        set({
          mutating: false,
          error: error instanceof Error ? error : new Error(String(error))
        })
        options?.onError?.(
          error instanceof Error ? error : new Error(String(error))
        )
        return null
      }
    },
    invalidate: () => {
      set({
        lastFetch: null,
        fetchStatus: 'idle'
      })
    },
    refresh: async () => {
      const { fetch } = get()
      set({ isValidating: true })
      return fetch()
    },
    setData: (data: T | null) => {
      set({
        data,
        lastFetch: data ? new Date() : null,
        fetchStatus: data ? 'success' : 'idle'
      })
    },
    optimisticUpdate: (updater: (current: T) => T) => {
      const state = get()
      if (state.data) {
        set({ data: updater(state.data) })
      }
    }
  })
  // ストア作成
  const store = createBaseStore(
    initialState,
    actions as any,
    { name: config.name, devtools: true }
  )
  // 自動フェッチの設定
  if (finalConfig.refetchInterval) {
    setInterval(() => {
      const state = store.getState()
      if (!state.loading && !state.isValidating) {
        state.refresh()
      }
    }, finalConfig.refetchInterval)
  }
  // ウィンドウフォーカス時の再フェッチ
  if (finalConfig.refetchOnWindowFocus && typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      const state = store.getState()
      if (!state.loading && !state.isValidating) {
        state.refresh()
      }
    })
  }
  return store as UseBoundStore<StoreApi<AsyncStore<T>>>
}
/**
 * ポーリングヘルパー
 */
export class PollingManager<T> {
  private intervalId: NodeJS.Timeout | null = null
  private store: UseBoundStore<StoreApi<AsyncStore<T>>>
  constructor(store: UseBoundStore<StoreApi<AsyncStore<T>>>) {
    this.store = store
  }
  start(interval: number): void {
    if (this.intervalId) return
    this.intervalId = setInterval(() => {
      const state = this.store.getState()
      if (!state.loading && !state.isValidating) {
        state.refresh()
      }
    }, interval)
  }
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  updateInterval(interval: number): void {
    this.stop()
    this.start(interval)
  }
}
/**
 * キューイングシステム
 */
export class MutationQueue<T> {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private store: UseBoundStore<StoreApi<AsyncStore<T>>>
  constructor(store: UseBoundStore<StoreApi<AsyncStore<T>>>) {
    this.store = store
  }
  async enqueue<R>(mutation: () => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await mutation()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      if (!this.processing) {
        this.process()
      }
    })
  }
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return
    this.processing = true
    while (this.queue.length > 0) {
      const mutation = this.queue.shift()
      if (mutation) {
        await mutation()
      }
    }
    this.processing = false
  }
  clear(): void {
    this.queue = []
  }
  get length(): number {
    return this.queue.length
  }
}
/**
 * データ同期マネージャー
 */
export class SyncManager<T> {
  private stores: Map<string, UseBoundStore<StoreApi<AsyncStore<T>>>> = new Map()
  private syncInterval: NodeJS.Timeout | null = null
  registerStore(name: string, store: UseBoundStore<StoreApi<AsyncStore<T>>>): void {
    this.stores.set(name, store)
  }
  unregisterStore(name: string): void {
    this.stores.delete(name)
  }
  async syncAll(): Promise<void> {
    const promises: Promise<any>[] = []
    this.stores.forEach((store) => {
      const state = store.getState()
      if (!state.loading && !state.isValidating) {
        promises.push(state.refresh())
      }
    })
    await Promise.all(promises)
  }
  startAutoSync(interval: number): void {
    if (this.syncInterval) return
    this.syncInterval = setInterval(() => {
      this.syncAll()
    }, interval)
  }
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
}
/**
 * 非同期ストアのフック
 */
export function useAsyncStore<T>(
  store: UseBoundStore<StoreApi<AsyncStore<T>>>,
  autoFetch = true
): AsyncStore<T> {
  const state = store()
  // 初回マウント時の自動フェッチ
  if (autoFetch && state.fetchStatus === 'idle' && !state.data) {
    state.fetch()
  }
  return state
}