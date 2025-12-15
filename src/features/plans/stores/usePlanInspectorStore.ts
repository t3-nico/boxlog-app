import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Plan Inspector状態管理
 *
 * features/inspector パターンに準拠しつつ、Plan固有の拡張を追加
 * - instanceDate: 繰り返しプランの特定インスタンス日付
 *
 * @see {@link @/features/inspector} 基本パターン
 */

/**
 * Inspector表示モード
 * - sheet: サイドパネル（右側に固定表示）
 * - popover: ポップアップ（クリック位置に表示）
 */
export type InspectorDisplayMode = 'sheet' | 'popover'

/**
 * Plan作成時に事前設定するデータ
 */
export interface PlanInitialData {
  start_time?: string // ISO datetime string
  end_time?: string // ISO datetime string
  // 将来的に追加可能: title?, description?, tags?, etc.
}

/**
 * Plan Inspector Store の状態
 */
interface PlanInspectorState {
  /** Inspector が開いているか */
  isOpen: boolean
  /** 対象プランのID（null = 新規作成モード） */
  planId: string | null
  /** 繰り返しプランの特定インスタンス日付（YYYY-MM-DD形式） */
  instanceDate: string | null
  /** 新規作成時の初期データ */
  initialData?: PlanInitialData | undefined
  /** 表示モード（sheet: サイドパネル, popover: ポップアップ） */
  displayMode: InspectorDisplayMode
  /** Popoverのアンカー要素の位置情報 */
  popoverAnchor?: { x: number; y: number } | undefined
}

/**
 * Plan Inspector Store のアクション
 */
interface PlanInspectorActions {
  /** Inspector を開く */
  openInspector: (
    planId: string | null,
    options?: { initialData?: PlanInitialData; instanceDate?: string; anchor?: { x: number; y: number } }
  ) => void
  /** Inspector を閉じる */
  closeInspector: () => void
  /** 表示モードを変更する */
  setDisplayMode: (mode: InspectorDisplayMode) => void
}

/**
 * Plan Inspector Store 型
 */
type PlanInspectorStore = PlanInspectorState & PlanInspectorActions

export const usePlanInspectorStore = create<PlanInspectorStore>()(
  devtools(
    persist(
      (set) => ({
        isOpen: false,
        planId: null,
        instanceDate: null,
        initialData: undefined,
        displayMode: 'sheet',
        popoverAnchor: undefined,

        openInspector: (planId, options) =>
          set(
            {
              isOpen: true,
              planId,
              instanceDate: options?.instanceDate ?? null,
              initialData: planId === null ? options?.initialData : undefined,
              popoverAnchor: options?.anchor,
            },
            false,
            'openInspector'
          ),

        closeInspector: () =>
          set(
            {
              isOpen: false,
              planId: null,
              instanceDate: null,
              initialData: undefined,
              popoverAnchor: undefined,
            },
            false,
            'closeInspector'
          ),

        setDisplayMode: (mode) => set({ displayMode: mode }, false, 'setDisplayMode'),
      }),
      {
        name: 'plan-inspector-settings',
        // displayModeのみ永続化（isOpenやplanIdは永続化しない）
        partialize: (state) => ({ displayMode: state.displayMode }),
      }
    ),
    { name: 'plan-inspector-store' }
  )
)
