import { create } from 'zustand'

/**
 * Plan Inspector状態管理
 *
 * 全ページ共通のPlan詳細Sheet表示を制御
 */

/**
 * Plan作成時に事前設定するデータ
 */
interface PlanInitialData {
  start_time?: string // ISO datetime string
  end_time?: string // ISO datetime string
  // 将来的に追加可能: title?, description?, tags?, etc.
}

interface PlanInspectorStore {
  isOpen: boolean
  planId: string | null
  /** 繰り返しプランの特定インスタンス日付（YYYY-MM-DD形式） */
  instanceDate: string | null
  initialData?: PlanInitialData | undefined
  openInspector: (planId: string | null, options?: { initialData?: PlanInitialData; instanceDate?: string }) => void
  closeInspector: () => void
}

export const usePlanInspectorStore = create<PlanInspectorStore>((set) => ({
  isOpen: false,
  planId: null,
  instanceDate: null,
  initialData: undefined,
  openInspector: (planId, options) =>
    set({
      isOpen: true,
      planId,
      instanceDate: options?.instanceDate ?? null,
      initialData: planId === null ? (options?.initialData ?? undefined) : undefined,
    }),
  closeInspector: () => set({ isOpen: false, planId: null, instanceDate: null, initialData: undefined }),
}))
