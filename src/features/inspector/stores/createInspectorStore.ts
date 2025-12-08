import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Inspector Store 基本状態
 */
export interface InspectorState<TId extends string = string> {
  /** Inspector が開いているか */
  isOpen: boolean
  /** 対象エンティティのID（null = 新規作成モード） */
  entityId: TId | null
}

/**
 * Inspector Store 基本アクション
 */
export interface InspectorActions<TId extends string = string> {
  /** Inspector を開く */
  openInspector: (entityId: TId | null) => void
  /** Inspector を閉じる */
  closeInspector: () => void
}

/**
 * Inspector Store 基本型
 */
export type InspectorStore<TId extends string = string> = InspectorState<TId> & InspectorActions<TId>

/**
 * createInspectorStore の設定
 */
export interface CreateInspectorStoreConfig {
  /** devtools 用のストア名 */
  storeName?: string
}

/**
 * 基本的な Inspector Store を作成するファクトリ
 *
 * シンプルなopen/close機能のみを提供
 * 追加の状態やアクションが必要な場合は、拡張版を使用
 *
 * @example
 * ```ts
 * // 基本的な使用
 * export const useTagInspectorStore = createInspectorStore({
 *   storeName: 'tag-inspector-store',
 * })
 *
 * // 使用例
 * const { isOpen, entityId, openInspector, closeInspector } = useTagInspectorStore()
 * openInspector('tag-123')
 * ```
 */
export function createInspectorStore<TId extends string = string>(
  config: CreateInspectorStoreConfig = {}
) {
  const { storeName = 'inspector-store' } = config

  return create<InspectorStore<TId>>()(
    devtools(
      (set) => ({
        isOpen: false,
        entityId: null,

        openInspector: (entityId) =>
          set(
            { isOpen: true, entityId },
            false,
            'openInspector'
          ),

        closeInspector: () =>
          set(
            { isOpen: false, entityId: null },
            false,
            'closeInspector'
          ),
      }),
      { name: storeName }
    )
  )
}

/**
 * 拡張 Inspector Store の状態（初期データ付き）
 */
export interface ExtendedInspectorState<TId extends string = string, TInitialData = unknown>
  extends InspectorState<TId> {
  /** 新規作成時の初期データ */
  initialData?: TInitialData | undefined
}

/**
 * 拡張 Inspector Store のアクション
 */
export interface ExtendedInspectorActions<TId extends string = string, TInitialData = unknown> {
  /** Inspector を開く（オプションで初期データ指定） */
  openInspector: (entityId: TId | null, options?: { initialData?: TInitialData }) => void
  /** Inspector を閉じる */
  closeInspector: () => void
}

/**
 * 拡張 Inspector Store 型
 */
export type ExtendedInspectorStore<TId extends string = string, TInitialData = unknown> =
  ExtendedInspectorState<TId, TInitialData> & ExtendedInspectorActions<TId, TInitialData>

/**
 * createExtendedInspectorStore の設定
 */
export interface CreateExtendedInspectorStoreConfig {
  /** devtools 用のストア名 */
  storeName?: string
}

/**
 * 拡張 Inspector Store を作成するファクトリ
 *
 * 初期データ (initialData) をサポート
 * Plan Inspector など、新規作成時に初期値を渡したい場合に使用
 *
 * @example
 * ```ts
 * interface PlanInitialData {
 *   start_time?: string
 *   end_time?: string
 * }
 *
 * export const usePlanInspectorStore = createExtendedInspectorStore<string, PlanInitialData>({
 *   storeName: 'plan-inspector-store',
 * })
 *
 * // 使用例
 * const { openInspector } = usePlanInspectorStore()
 * openInspector(null, { initialData: { start_time: '2024-01-01T09:00:00' } })
 * ```
 */
export function createExtendedInspectorStore<TId extends string = string, TInitialData = unknown>(
  config: CreateExtendedInspectorStoreConfig = {}
) {
  const { storeName = 'extended-inspector-store' } = config

  return create<ExtendedInspectorStore<TId, TInitialData>>()(
    devtools(
      (set) => ({
        isOpen: false,
        entityId: null,
        initialData: undefined as TInitialData | undefined,

        openInspector: (entityId, options) => {
          const newState: Partial<ExtendedInspectorStore<TId, TInitialData>> = {
            isOpen: true,
            entityId,
          }
          // 新規作成時のみ initialData を設定
          if (entityId === null && options?.initialData !== undefined) {
            newState.initialData = options.initialData
          } else {
            newState.initialData = undefined as TInitialData | undefined
          }
          set(newState, false, 'openInspector')
        },

        closeInspector: () => {
          const newState: Partial<ExtendedInspectorStore<TId, TInitialData>> = {
            isOpen: false,
            entityId: null,
            initialData: undefined as TInitialData | undefined,
          }
          set(newState, false, 'closeInspector')
        },
      }),
      { name: storeName }
    )
  )
}
