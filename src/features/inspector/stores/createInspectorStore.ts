import { create, type StateCreator } from 'zustand'
import { devtools, persist, type PersistOptions } from 'zustand/middleware'

/**
 * Inspector表示モード
 * - sheet: サイドパネル（右側に固定表示）
 * - popover: ポップアップ（クリック位置に表示）
 */
export type InspectorDisplayMode = 'sheet' | 'popover'

/**
 * Inspector Store 基本状態
 */
export interface InspectorState<TId extends string = string> {
  /** Inspector が開いているか */
  isOpen: boolean
  /** 対象エンティティのID（null = 新規作成モード） */
  entityId: TId | null
  /** 表示モード（sheet: サイドパネル, popover: ポップアップ） */
  displayMode: InspectorDisplayMode
}

/**
 * Inspector Store 基本アクション
 */
export interface InspectorActions<TId extends string = string> {
  /** Inspector を開く */
  openInspector: (entityId: TId | null) => void
  /** Inspector を閉じる */
  closeInspector: () => void
  /** 表示モードを変更する */
  setDisplayMode: (mode: InspectorDisplayMode) => void
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
  /** persist 用のストレージキー（指定するとdisplayModeが永続化される） */
  persistKey?: string
}

/**
 * 基本的な Inspector Store を作成するファクトリ
 *
 * シンプルなopen/close機能とdisplayMode切り替えを提供
 * 追加の状態やアクションが必要な場合は、拡張版を使用
 *
 * @example
 * ```ts
 * // 基本的な使用
 * export const useTagInspectorStore = createInspectorStore({
 *   storeName: 'tag-inspector-store',
 *   persistKey: 'tag-inspector-settings',
 * })
 *
 * // 使用例
 * const { isOpen, entityId, displayMode, openInspector, closeInspector, setDisplayMode } = useTagInspectorStore()
 * openInspector('tag-123')
 * setDisplayMode('popover')
 * ```
 */
export function createInspectorStore<TId extends string = string>(config: CreateInspectorStoreConfig = {}) {
  const { storeName = 'inspector-store', persistKey } = config

  const createState: StateCreator<InspectorStore<TId>, [], []> = (set) => ({
    isOpen: false,
    entityId: null,
    displayMode: 'sheet',

    openInspector: (entityId) => set({ isOpen: true, entityId }),

    closeInspector: () => set({ isOpen: false, entityId: null }),

    setDisplayMode: (mode) => set({ displayMode: mode }),
  })

  // persistKeyが指定されている場合は永続化する
  if (persistKey) {
    const persistOptions: PersistOptions<InspectorStore<TId>, Pick<InspectorStore<TId>, 'displayMode'>> = {
      name: persistKey,
      partialize: (state) => ({ displayMode: state.displayMode }),
    }

    return create<InspectorStore<TId>>()(devtools(persist(createState, persistOptions), { name: storeName }))
  }

  return create<InspectorStore<TId>>()(devtools(createState, { name: storeName }))
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
  /** 表示モードを変更する */
  setDisplayMode: (mode: InspectorDisplayMode) => void
}

/**
 * 拡張 Inspector Store 型
 */
export type ExtendedInspectorStore<TId extends string = string, TInitialData = unknown> = ExtendedInspectorState<
  TId,
  TInitialData
> &
  ExtendedInspectorActions<TId, TInitialData>

/**
 * createExtendedInspectorStore の設定
 */
export interface CreateExtendedInspectorStoreConfig {
  /** devtools 用のストア名 */
  storeName?: string
  /** persist 用のストレージキー（指定するとdisplayModeが永続化される） */
  persistKey?: string
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
  const { storeName = 'extended-inspector-store', persistKey } = config

  const createState: StateCreator<ExtendedInspectorStore<TId, TInitialData>, [], []> = (set) => ({
    isOpen: false,
    entityId: null,
    displayMode: 'sheet',
    initialData: undefined,

    openInspector: (entityId, options) => {
      set({
        isOpen: true,
        entityId,
        initialData: entityId === null ? options?.initialData : undefined,
      })
    },

    closeInspector: () => {
      set({
        isOpen: false,
        entityId: null,
        initialData: undefined,
      })
    },

    setDisplayMode: (mode) => set({ displayMode: mode }),
  })

  // persistKeyが指定されている場合は永続化する
  if (persistKey) {
    const persistOptions: PersistOptions<
      ExtendedInspectorStore<TId, TInitialData>,
      Pick<ExtendedInspectorStore<TId, TInitialData>, 'displayMode'>
    > = {
      name: persistKey,
      partialize: (state) => ({ displayMode: state.displayMode }),
    }

    return create<ExtendedInspectorStore<TId, TInitialData>>()(
      devtools(persist(createState, persistOptions), { name: storeName })
    )
  }

  return create<ExtendedInspectorStore<TId, TInitialData>>()(devtools(createState, { name: storeName }))
}
