// @ts-nocheck TODO(#389): 型エラー5件を段階的に修正する
/**
 * 統一ストアファクトリー
 * 全ストアパターンを統一的に作成・管理するファクトリーシステム
 */

import { StoreApi, UseBoundStore } from 'zustand'
import {
  createBaseStore,
  BaseStore,
  StoreOptions,
  StoreSubscription
} from '../stores/patterns/base-store'
import {
  createAsyncStore,
  AsyncStore,
  AsyncStoreConfig
} from '../stores/patterns/async-store'
import {
  createPersistedStore,
  PersistedStore,
  PersistConfig,
  globalHydrationManager
} from '../stores/patterns/persisted-store'
import {
  createRealtimeStore,
  RealtimeStore,
  RealtimeConfig,
  globalRealtimeSyncManager
} from '../stores/patterns/realtime-store'

/**
 * ストアタイプ定義
 */
export type StoreType = 'base' | 'async' | 'persisted' | 'realtime' | 'hybrid'

/**
 * ハイブリッドストア設定
 */
export interface HybridStoreConfig<T> {
  name: string
  base?: StoreOptions
  async?: Partial<AsyncStoreConfig<T>>
  persist?: Partial<PersistConfig<T>>
  realtime?: Partial<RealtimeConfig<T>>
}

/**
 * ストアファクトリー設定
 */
export interface StoreFactoryConfig<T> {
  type: StoreType
  name: string
  initialState: T
  devtools?: boolean
  middleware?: string[]
  onCreated?: (store: any) => void
  onDestroyed?: (store: any) => void
}

/**
 * ストア登録情報
 */
interface StoreRegistration<T = any> {
  name: string
  type: StoreType
  store: UseBoundStore<StoreApi<T>>
  config: StoreFactoryConfig<any>
  createdAt: Date
  subscriptions: StoreSubscription<T>[]
}

/**
 * グローバルストアレジストリ
 */
class GlobalStoreRegistry {
  private stores: Map<string, StoreRegistration> = new Map()
  private middleware: Map<string, (store: any) => any> = new Map()

  /**
   * ストアを登録
   */
  register<T>(
    name: string,
    store: UseBoundStore<StoreApi<T>>,
    config: StoreFactoryConfig<any>
  ): void {
    if (this.stores.has(name)) {
      console.warn(`Store "${name}" is already registered`)
      return
    }

    const registration: StoreRegistration<T> = {
      name,
      type: config.type,
      store,
      config,
      createdAt: new Date(),
      subscriptions: []
    }

    this.stores.set(name, registration)

    // 自動登録（タイプ別）
    if (config.type === 'persisted' || config.type === 'hybrid') {
      globalHydrationManager.registerStore(name, store as any)
    }

    if (config.type === 'realtime' || config.type === 'hybrid') {
      globalRealtimeSyncManager.registerStore(name, store as any)
    }

    config.onCreated?.(store)
  }

  /**
   * ストアを取得
   */
  get<T>(name: string): UseBoundStore<StoreApi<T>> | null {
    const registration = this.stores.get(name)
    return registration ? registration.store as UseBoundStore<StoreApi<T>> : null
  }

  /**
   * ストアを削除
   */
  unregister(name: string): void {
    const registration = this.stores.get(name)
    if (!registration) return

    // クリーンアップ
    registration.subscriptions.forEach(sub => sub.unsubscribeAll())

    // 自動削除（タイプ別）
    if (registration.type === 'persisted' || registration.type === 'hybrid') {
      globalHydrationManager.unregisterStore?.(name)
    }

    if (registration.type === 'realtime' || registration.type === 'hybrid') {
      globalRealtimeSyncManager.unregisterStore(name)
    }

    registration.config.onDestroyed?.(registration.store)
    this.stores.delete(name)
  }

  /**
   * 全ストア一覧取得
   */
  list(): Array<{
    name: string
    type: StoreType
    createdAt: Date
  }> {
    return Array.from(this.stores.values()).map(reg => ({
      name: reg.name,
      type: reg.type,
      createdAt: reg.createdAt
    }))
  }

  /**
   * ストア統計取得
   */
  getStats(): {
    total: number
    byType: Record<StoreType, number>
    avgCreationTime: number
  } {
    const registrations = Array.from(this.stores.values())
    const byType: Record<StoreType, number> = {
      base: 0,
      async: 0,
      persisted: 0,
      realtime: 0,
      hybrid: 0
    }

    registrations.forEach(reg => {
      byType[reg.type]++
    })

    const now = Date.now()
    const avgCreationTime = registrations.length > 0
      ? registrations.reduce((sum, reg) => sum + (now - reg.createdAt.getTime()), 0) / registrations.length
      : 0

    return {
      total: registrations.length,
      byType,
      avgCreationTime
    }
  }

  /**
   * ミドルウェア登録
   */
  registerMiddleware(name: string, middleware: (store: any) => any): void {
    this.middleware.set(name, middleware)
  }

  /**
   * ミドルウェア取得
   */
  getMiddleware(name: string): ((store: any) => any) | null {
    return this.middleware.get(name) || null
  }

  /**
   * 全ストアのクリーンアップ
   */
  clear(): void {
    const storeNames = Array.from(this.stores.keys())
    storeNames.forEach(name => this.unregister(name))
  }
}

/**
 * グローバルストアレジストリインスタンス
 */
export const globalStoreRegistry = new GlobalStoreRegistry()

/**
 * 統一ストアファクトリー
 */
export class StoreFactory {
  /**
   * ストアを作成
   */
  static create<T extends Record<string, any>>(
    config: StoreFactoryConfig<T> & {
      actions?: (set: any, get: any) => Record<string, any>
    }
  ): UseBoundStore<StoreApi<BaseStore<T>>> {
    const store = createBaseStore(
      config.initialState,
      config.actions,
      {
        name: config.name,
        devtools: config.devtools ?? true
      }
    )

    globalStoreRegistry.register(config.name, store, config)
    return store
  }

  /**
   * 非同期ストアを作成
   */
  static createAsync<T extends Record<string, any>>(
    config: StoreFactoryConfig<T> & AsyncStoreConfig<T>
  ): UseBoundStore<StoreApi<AsyncStore<T>>> {
    const store = createAsyncStore({
      name: config.name,
      fetcher: config.fetcher,
      mutator: config.mutator,
      cacheTime: config.cacheTime,
      staleTime: config.staleTime,
      refetchOnMount: config.refetchOnMount,
      refetchOnWindowFocus: config.refetchOnWindowFocus,
      refetchInterval: config.refetchInterval,
      retry: config.retry,
      retryDelay: config.retryDelay
    })

    globalStoreRegistry.register(config.name, store, {
      ...config,
      type: 'async'
    })

    return store
  }

  /**
   * 永続化ストアを作成
   */
  static createPersisted<T extends Record<string, any>>(
    config: StoreFactoryConfig<T> & {
      persist: PersistConfig<T>
      actions?: (set: any, get: any) => Record<string, any>
    }
  ): UseBoundStore<StoreApi<PersistedStore<T>>> {
    const store = createPersistedStore(
      config.initialState,
      config.persist,
      config.actions
    )

    globalStoreRegistry.register(config.name, store, {
      ...config,
      type: 'persisted'
    })

    return store
  }

  /**
   * リアルタイムストアを作成
   */
  static createRealtime<T extends Record<string, any>>(
    config: StoreFactoryConfig<T> & RealtimeConfig<T>
  ): UseBoundStore<StoreApi<RealtimeStore<T>>> {
    const store = createRealtimeStore(config.initialState, {
      name: config.name,
      connectionType: config.connectionType,
      url: config.url,
      protocols: config.protocols,
      reconnectInterval: config.reconnectInterval,
      maxRetries: config.maxRetries,
      heartbeatInterval: config.heartbeatInterval,
      messageHandler: config.messageHandler,
      errorHandler: config.errorHandler,
      connectionHandler: config.connectionHandler,
      channels: config.channels,
      authentication: config.authentication
    })

    globalStoreRegistry.register(config.name, store, {
      ...config,
      type: 'realtime'
    })

    return store
  }

  /**
   * ハイブリッドストアを作成（複数パターンの組み合わせ）
   */
  static createHybrid<T extends Record<string, any>>(
    config: StoreFactoryConfig<T> & HybridStoreConfig<T> & {
      actions?: (set: any, get: any) => Record<string, any>
    }
  ): UseBoundStore<StoreApi<any>> {
    let store: UseBoundStore<StoreApi<any>>

    // ベースから開始
    if (config.persist) {
      // 永続化ベース
      store = createPersistedStore(
        config.initialState,
        {
          name: config.name,
          ...config.persist
        } as PersistConfig<T>,
        config.actions
      )
    } else {
      // 通常ベース
      store = createBaseStore(
        config.initialState,
        config.actions,
        config.base || { name: config.name }
      )
    }

    // 非同期機能の追加
    if (config.async) {
      // TODO: 非同期機能をベースストアに統合
      console.warn('Async functionality integration not implemented yet')
    }

    // リアルタイム機能の追加
    if (config.realtime) {
      // TODO: リアルタイム機能をベースストアに統合
      console.warn('Realtime functionality integration not implemented yet')
    }

    globalStoreRegistry.register(config.name, store, {
      ...config,
      type: 'hybrid'
    })

    return store
  }

  /**
   * ストアを取得
   */
  static get<T>(name: string): UseBoundStore<StoreApi<T>> | null {
    return globalStoreRegistry.get<T>(name)
  }

  /**
   * ストアを削除
   */
  static destroy(name: string): void {
    globalStoreRegistry.unregister(name)
  }

  /**
   * 全ストア取得
   */
  static list(): Array<{
    name: string
    type: StoreType
    createdAt: Date
  }> {
    return globalStoreRegistry.list()
  }

  /**
   * ストア統計取得
   */
  static getStats(): {
    total: number
    byType: Record<StoreType, number>
    avgCreationTime: number
  } {
    return globalStoreRegistry.getStats()
  }

  /**
   * 全ストアのクリーンアップ
   */
  static clear(): void {
    globalStoreRegistry.clear()
  }
}

/**
 * ストアコンポーザー（複数ストアの組み合わせ）
 */
export class StoreComposer {
  private stores: Map<string, UseBoundStore<StoreApi<any>>> = new Map()

  /**
   * ストアを追加
   */
  add<T>(name: string, store: UseBoundStore<StoreApi<T>>): this {
    this.stores.set(name, store)
    return this
  }

  /**
   * 複合セレクター作成
   */
  createSelector<T>(
    selector: (stores: Record<string, any>) => T
  ): () => T {
    return () => {
      const storeValues: Record<string, any> = {}
      this.stores.forEach((store, name) => {
        storeValues[name] = store.getState()
      })
      return selector(storeValues)
    }
  }

  /**
   * 複合アクション作成
   */
  createAction(action: (stores: Record<string, any>) => void): () => void {
    return () => {
      const storeValues: Record<string, any> = {}
      this.stores.forEach((store, name) => {
        storeValues[name] = store.getState()
      })
      action(storeValues)
    }
  }

  /**
   * 全ストアの購読
   */
  subscribe(listener: (stores: Record<string, any>) => void): () => void {
    const unsubscribes: (() => void)[] = []

    this.stores.forEach((store, name) => {
      const unsubscribe = store.subscribe(
        (state) => state,
        () => {
          const storeValues: Record<string, any> = {}
          this.stores.forEach((s, n) => {
            storeValues[n] = s.getState()
          })
          listener(storeValues)
        }
      )
      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }
}

/**
 * デバッグユーティリティ
 */
export class StoreDebugger {
  /**
   * ストア状態のダンプ
   */
  static dump(name?: string): any {
    if (name) {
      const store = globalStoreRegistry.get(name)
      return store ? store.getState() : null
    }

    const allStores: Record<string, any> = {}
    globalStoreRegistry.list().forEach(({ name }) => {
      const store = globalStoreRegistry.get(name)
      if (store) {
        allStores[name] = store.getState()
      }
    })

    return allStores
  }

  /**
   * ストア状態の監視
   */
  static watch(name: string, logger?: (state: any) => void): () => void {
    const store = globalStoreRegistry.get(name)
    if (!store) {
      throw new Error(`Store "${name}" not found`)
    }

    return store.subscribe(
      (state) => state,
      (state) => {
        if (logger) {
          logger(state)
        } else {
          console.log(`[${name}]`, state)
        }
      }
    )
  }

  /**
   * パフォーマンス監視
   */
  static startPerformanceMonitoring(name: string): () => void {
    const store = globalStoreRegistry.get(name)
    if (!store) {
      throw new Error(`Store "${name}" not found`)
    }

    const startTime = performance.now()
    let updateCount = 0

    const unsubscribe = store.subscribe(
      (state) => state,
      () => {
        updateCount++
        const avgTime = (performance.now() - startTime) / updateCount
        console.log(`[${name}] Updates: ${updateCount}, Avg time: ${avgTime.toFixed(2)}ms`)
      }
    )

    return unsubscribe
  }
}

/**
 * デフォルトエクスポート
 */
export default StoreFactory