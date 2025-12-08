import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Plan Inspector状態管理
 *
 * features/inspector パターンに準拠しつつ、Plan固有の拡張を追加
 * - instanceDate: 繰り返しプランの特定インスタンス日付
 *
 * @see {@link @/features/inspector} 基本パターン
 */

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
}

/**
 * Plan Inspector Store のアクション
 */
interface PlanInspectorActions {
  /** Inspector を開く */
  openInspector: (planId: string | null, options?: { initialData?: PlanInitialData; instanceDate?: string }) => void
  /** Inspector を閉じる */
  closeInspector: () => void
}

/**
 * Plan Inspector Store 型
 */
type PlanInspectorStore = PlanInspectorState & PlanInspectorActions

export const usePlanInspectorStore = create<PlanInspectorStore>()(
  devtools(
    (set) => ({
      isOpen: false,
      planId: null,
      instanceDate: null,
      initialData: undefined,

      openInspector: (planId, options) =>
        set(
          {
            isOpen: true,
            planId,
            instanceDate: options?.instanceDate ?? null,
            initialData: planId === null ? options?.initialData : undefined,
          },
          false,
          'openInspector'
        ),

      closeInspector: () =>
        set({ isOpen: false, planId: null, instanceDate: null, initialData: undefined }, false, 'closeInspector'),
    }),
    { name: 'plan-inspector-store' }
  )
)
