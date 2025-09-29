/**
 * 永続化ストアパターン
 * localStorage/sessionStorageを使用した状態の永続化
 */

import { StateCreator, StoreApi, UseBoundStore } from 'zustand'
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware'
import { createBaseStore, BaseStore } from './base-store'

/**
 * 永続化設定インターフェース
 */
export interface PersistConfig<T> {
  name: string
  storage?: 'localStorage' | 'sessionStorage'
  version?: number
  migrate?: (persistedState: any, version: number) => T
  partialize?: (state: T) => Partial<T>
  merge?: (persistedState: any, currentState: T) => T
  skipHydration?: boolean
  onRehydrateStorage?: (state: T) => ((state?: T, error?: Error) => void) | void
}

/**
 * 永続化状態インターフェース
 */
export interface PersistedState {
  _hasHydrated: boolean
  _hydrationComplete: boolean
}

/**
 * 永続化アクションインターフェース
 */
export interface PersistedActions {
  rehydrate: () => Promise<void>
  persist: () => void
  clearPersistedState: () => void
  getPersistedState: () => any
}

/**
 * 永続化ストアの型定義
 */
export type PersistedStore<T> = BaseStore &
  T &
  PersistedState &
  PersistedActions

/**
 * 永続化ストアを作成するファクトリー関数
 */
export function createPersistedStore<T extends Record<string, any>>(
  initialState: T,
  persistConfig: PersistConfig<T>,
  actions?: (
    set: (state: Partial<T>) => void,
    get: () => PersistedStore<T>
  ) => Record<string, any>
): UseBoundStore<StoreApi<PersistedStore<T>>> {
  // ストレージタイプの決定
  const storage = persistConfig.storage === 'sessionStorage'
    ? createJSONStorage(() => sessionStorage)
    : createJSONStorage(() => localStorage)

  // 永続化オプション
  const persistOptions: PersistOptions<PersistedStore<T>, Partial<T>> = {
    name: persistConfig.name,
    storage,
    version: persistConfig.version || 1,
    migrate: persistConfig.migrate as any,
    partialize: persistConfig.partialize
      ? (state) => persistConfig.partialize!(state as T)
      : (state) => {
          // デフォルトでは内部状態を除外
          const { _hasHydrated, _hydrationComplete, loading, error, ...rest } = state as any
          return rest
        },
    merge: persistConfig.merge
      ? (persistedState, currentState) =>
          persistConfig.merge!(persistedState, currentState as T) as PersistedStore<T>
      : (persistedState, currentState) => ({
          ...currentState,
          ...persistedState
        }),
    skipHydration: persistConfig.skipHydration,
    onRehydrateStorage: persistConfig.onRehydrateStorage
      ? () => persistConfig.onRehydrateStorage!(undefined as any)
      : () => (state?: PersistedStore<T>, error?: Error) => {
          if (error) {
            console.error('Failed to rehydrate store:', error)
          } else if (state) {
            state._hasHydrated = true
            state._hydrationComplete = true
          }
        }
  }

  // 永続化状態とアクション
  const persistedInitialState: PersistedState = {
    _hasHydrated: false,
    _hydrationComplete: false
  }

  const createPersistedActions = (
    set: any,
    get: any
  ): PersistedActions => ({
    rehydrate: async () => {
      const state = get()
      if (state._hasHydrated) return

      try {
        const persistedData = getStoredData(persistConfig.name, storage)
        if (persistedData) {
          const migratedData = persistConfig.migrate
            ? persistConfig.migrate(persistedData, persistConfig.version || 1)
            : persistedData

          const mergedData = persistConfig.merge
            ? persistConfig.merge(migratedData, state)
            : { ...state, ...migratedData }

          set({
            ...mergedData,
            _hasHydrated: true,
            _hydrationComplete: true
          })
        } else {
          set({
            _hasHydrated: true,
            _hydrationComplete: true
          })
        }
      } catch (error) {
        console.error('Rehydration failed:', error)
        set({
          _hasHydrated: true,
          _hydrationComplete: true
        })
      }
    },

    persist: () => {
      const state = get()
      const dataToStore = persistConfig.partialize
        ? persistConfig.partialize(state)
        : state

      storeData(persistConfig.name, dataToStore, storage)
    },

    clearPersistedState: () => {
      clearStoredData(persistConfig.name, storage)
      set({
        ...initialState,
        _hasHydrated: true,
        _hydrationComplete: true
      })
    },

    getPersistedState: () => {
      return getStoredData(persistConfig.name, storage)
    }
  })

  // ストア作成
  const storeCreator: StateCreator<
    PersistedStore<T>,
    [],
    [],
    PersistedStore<T>
  > = persist(
    (set, get) => ({
      ...initialState,
      ...persistedInitialState,
      ...createPersistedActions(set, get),
      ...(actions ? actions(set as any, get as any) : {})
    }),
    persistOptions
  )

  const store = createBaseStore(
    initialState,
    (set, get) => ({
      ...createPersistedActions(set, get),
      ...(actions ? actions(set as any, get as any) : {})
    }),
    { name: persistConfig.name, devtools: true }
  ) as any

  // 手動でpersist機能を追加
  const persistedStore = persist(
    storeCreator as any,
    persistOptions
  )

  return persistedStore as UseBoundStore<StoreApi<PersistedStore<T>>>
}

/**
 * ストレージユーティリティ関数
 */
function getStoredData(key: string, storage: any): any {
  try {
    const stored = storage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error(`Failed to get stored data for key "${key}":`, error)
    return null
  }
}

function storeData(key: string, data: any, storage: any): void {
  try {
    storage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to store data for key "${key}":`, error)
  }
}

function clearStoredData(key: string, storage: any): void {
  try {
    storage.removeItem(key)
  } catch (error) {
    console.error(`Failed to clear stored data for key "${key}":`, error)
  }
}

/**
 * 永続化ストアのハイドレーション管理
 */
export class HydrationManager {
  private stores: Map<string, UseBoundStore<StoreApi<any>>> = new Map()
  private hydrationPromises: Map<string, Promise<void>> = new Map()

  registerStore(name: string, store: UseBoundStore<StoreApi<any>>): void {
    this.stores.set(name, store)
  }

  async hydrateStore(name: string): Promise<void> {
    const store = this.stores.get(name)
    if (!store) {
      throw new Error(`Store "${name}" not found`)
    }

    if (this.hydrationPromises.has(name)) {
      return this.hydrationPromises.get(name)!
    }

    const promise = store.getState().rehydrate?.()
    if (promise) {
      this.hydrationPromises.set(name, promise)
      await promise
      this.hydrationPromises.delete(name)
    }
  }

  async hydrateAll(): Promise<void> {
    const promises: Promise<void>[] = []

    this.stores.forEach((store, name) => {
      if (store.getState().rehydrate) {
        promises.push(this.hydrateStore(name))
      }
    })

    await Promise.all(promises)
  }

  isHydrated(name: string): boolean {
    const store = this.stores.get(name)
    return store?.getState()._hasHydrated || false
  }

  areAllHydrated(): boolean {
    return Array.from(this.stores.values()).every(
      store => store.getState()._hasHydrated
    )
  }
}

/**
 * グローバルハイドレーションマネージャー
 */
export const globalHydrationManager = new HydrationManager()

/**
 * ハイドレーション完了を待つフック
 */
export function useHydration(
  store?: UseBoundStore<StoreApi<any>>,
  storeName?: string
): { isHydrated: boolean; isHydrating: boolean } {
  if (store) {
    const state = store()
    return {
      isHydrated: state._hasHydrated || false,
      isHydrating: !state._hydrationComplete && state._hasHydrated
    }
  }

  if (storeName) {
    return {
      isHydrated: globalHydrationManager.isHydrated(storeName),
      isHydrating: false // 簡易実装
    }
  }

  return {
    isHydrated: globalHydrationManager.areAllHydrated(),
    isHydrating: false
  }
}

/**
 * 永続化データのマイグレーション
 */
export class MigrationManager {
  private migrations: Map<number, (state: any) => any> = new Map()

  addMigration(version: number, migrator: (state: any) => any): void {
    this.migrations.set(version, migrator)
  }

  migrate(state: any, fromVersion: number, toVersion: number): any {
    let migratedState = state

    for (let version = fromVersion + 1; version <= toVersion; version++) {
      const migrator = this.migrations.get(version)
      if (migrator) {
        migratedState = migrator(migratedState)
      }
    }

    return migratedState
  }

  hasmigrations(fromVersion: number, toVersion: number): boolean {
    for (let version = fromVersion + 1; version <= toVersion; version++) {
      if (this.migrations.has(version)) {
        return true
      }
    }
    return false
  }
}

/**
 * SSR対応のハイドレーション
 */
export function createSSRPersistedStore<T extends Record<string, any>>(
  initialState: T,
  persistConfig: PersistConfig<T>,
  actions?: (
    set: (state: Partial<T>) => void,
    get: () => PersistedStore<T>
  ) => Record<string, any>
): UseBoundStore<StoreApi<PersistedStore<T>>> {
  // SSR環境では永続化をスキップ
  if (typeof window === 'undefined') {
    return createBaseStore(
      { ...initialState, _hasHydrated: true, _hydrationComplete: true },
      actions as any,
      { name: persistConfig.name }
    ) as any
  }

  return createPersistedStore(initialState, persistConfig, actions)
}

/**
 * 永続化ストアの監視
 */
export class PersistenceWatcher {
  private watchers: Map<string, (state: any) => void> = new Map()

  watch<T>(
    store: UseBoundStore<StoreApi<PersistedStore<T>>>,
    selector: (state: T) => any = (state) => state,
    callback?: (newValue: any, previousValue: any) => void
  ): () => void {
    return store.subscribe(
      selector as any,
      (newValue, previousValue) => {
        // 自動永続化
        const state = store.getState()
        if (state._hasHydrated) {
          state.persist()
        }

        callback?.(newValue, previousValue)
      }
    )
  }

  watchMultiple<T>(
    stores: Array<{
      store: UseBoundStore<StoreApi<PersistedStore<T>>>
      selector?: (state: T) => any
      callback?: (newValue: any, previousValue: any) => void
    }>
  ): () => void {
    const unsubscribes = stores.map(({ store, selector, callback }) =>
      this.watch(store, selector, callback)
    )

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }
}

/**
 * グローバル永続化ウォッチャー
 */
export const globalPersistenceWatcher = new PersistenceWatcher()