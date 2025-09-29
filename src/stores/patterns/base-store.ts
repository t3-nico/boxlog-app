/**
 * 基本ストアパターン
 * すべてのZustandストアの基礎となるテンプレート
 */

import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { immer } from 'zustand/middleware/immer'

/**
 * 基本ストアの状態インターフェース
 */
export interface BaseState {
  loading: boolean
  error: Error | null
  initialized: boolean
}

/**
 * 基本ストアのアクションインターフェース
 */
export interface BaseActions {
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  reset: () => void
  initialize: () => Promise<void>
}

/**
 * 基本ストアの型定義
 */
export type BaseStore<T extends Record<string, any> = {}> = BaseState &
  BaseActions &
  T

/**
 * ストア設定オプション
 */
export interface StoreOptions {
  name: string
  devtools?: boolean
  immer?: boolean
}

/**
 * 基本ストアを作成するファクトリー関数
 * @param initialState - 初期状態
 * @param actions - カスタムアクション
 * @param options - ストア設定
 */
export function createBaseStore<
  T extends Record<string, any>,
  A extends Record<string, any>
>(
  initialState: T,
  actions?: (
    set: (state: T & BaseState) => void,
    get: () => T & BaseState & BaseActions
  ) => A,
  options?: StoreOptions
): UseBoundStore<StoreApi<BaseStore<T> & A>> {
  const defaultOptions: StoreOptions = {
    name: 'store',
    devtools: process.env.NODE_ENV === 'development',
    immer: true,
    ...options
  }

  // 基本状態
  const baseInitialState: BaseState = {
    loading: false,
    error: null,
    initialized: false
  }

  // 基本アクション
  const createBaseActions = (
    set: any,
    get: any
  ): BaseActions => ({
    setLoading: (loading: boolean) =>
      set((state: BaseState) => ({ loading }), false, 'setLoading'),

    setError: (error: Error | null) =>
      set((state: BaseState) => ({ error }), false, 'setError'),

    reset: () =>
      set(
        () => ({ ...baseInitialState, ...initialState }),
        false,
        'reset'
      ),

    initialize: async () => {
      const state = get()
      if (state.initialized) return

      set({ initialized: true }, false, 'initialize')
    }
  })

  // ストア作成関数
  const storeCreator: StateCreator<
    BaseStore<T> & A,
    [],
    [],
    BaseStore<T> & A
  > = (set, get, api) => ({
    ...baseInitialState,
    ...initialState,
    ...createBaseActions(set, get),
    ...(actions ? actions(set as any, get as any) : ({} as A))
  })

  // ミドルウェアの適用
  let finalCreator = storeCreator

  if (defaultOptions.immer) {
    finalCreator = immer(finalCreator) as any
  }

  if (defaultOptions.devtools) {
    finalCreator = devtools(
      finalCreator,
      { name: defaultOptions.name }
    ) as any
  }

  finalCreator = subscribeWithSelector(finalCreator) as any

  return create<BaseStore<T> & A>(finalCreator)
}

/**
 * セレクターユーティリティ
 * 複数のプロパティを効率的に選択
 */
export function createSelector<T extends Record<string, any>>(
  keys: (keyof T)[]
) {
  return (state: T) => {
    const selected: Partial<T> = {}
    keys.forEach(key => {
      selected[key] = state[key]
    })
    return selected
  }
}

/**
 * 浅い比較を使用したuseStore
 */
export function useStoreWithShallow<T, U>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => U
): U {
  return store(selector, shallow)
}

/**
 * エラーハンドリングヘルパー
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>,
  set: (state: Partial<BaseState>) => void
): Promise<T | null> {
  set({ loading: true, error: null })

  try {
    const result = await action()
    set({ loading: false })
    return result
  } catch (error) {
    set({
      loading: false,
      error: error instanceof Error ? error : new Error(String(error))
    })
    return null
  }
}

/**
 * 楽観的更新ヘルパー
 */
export async function withOptimisticUpdate<T, S>(
  optimisticUpdate: () => void,
  actualUpdate: () => Promise<T>,
  rollback: (previousState: S) => void,
  getPreviousState: () => S
): Promise<T | null> {
  const previousState = getPreviousState()

  // 楽観的更新を即座に適用
  optimisticUpdate()

  try {
    // 実際の更新を実行
    const result = await actualUpdate()
    return result
  } catch (error) {
    // エラー時はロールバック
    rollback(previousState)
    throw error
  }
}

/**
 * デバウンスヘルパー
 */
export function createDebouncedAction<T extends (...args: any[]) => any>(
  action: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)

    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(action(...args))
      }, delay)
    })
  }) as T
}

/**
 * ストア永続化のインターフェース
 */
export interface PersistOptions<T> {
  name: string
  storage?: 'localStorage' | 'sessionStorage'
  version?: number
  migrate?: (state: any, version: number) => T
  partialize?: (state: T) => Partial<T>
  merge?: (persistedState: any, currentState: T) => T
}

/**
 * 型安全なストア作成のヘルパー型
 */
export type ExtractState<S> = S extends UseBoundStore<StoreApi<infer T>> ? T : never
export type ExtractActions<S> = {
  [K in keyof S as S[K] extends (...args: any[]) => any ? K : never]: S[K]
}

/**
 * ストアのサブスクリプションユーティリティ
 */
export class StoreSubscription<T> {
  private unsubscribes: (() => void)[] = []

  subscribe(
    store: UseBoundStore<StoreApi<T>>,
    selector: (state: T) => any,
    listener: (value: any, previousValue: any) => void
  ): void {
    const unsubscribe = store.subscribe(
      selector,
      listener
    )
    this.unsubscribes.push(unsubscribe)
  }

  unsubscribeAll(): void {
    this.unsubscribes.forEach(unsubscribe => unsubscribe())
    this.unsubscribes = []
  }
}

/**
 * Redux DevToolsメッセージタイプ
 */
export type DevToolsMessage = {
  type: string
  payload?: any
  timestamp?: number
}

/**
 * カスタムDevTools統合
 */
export function sendToDevTools(
  storeName: string,
  action: string,
  state: any
): void {
  if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
      name: storeName
    })

    devTools.send(action, state)
  }
}