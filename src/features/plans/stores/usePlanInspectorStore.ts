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
  initialData?: PlanInitialData
  openInspector: (planId: string | null, initialData?: PlanInitialData) => void
  closeInspector: () => void
}

export const usePlanInspectorStore = create<PlanInspectorStore>((set) => ({
  isOpen: false,
  planId: null,
  initialData: undefined,
  openInspector: (planId, initialData) =>
    set({ isOpen: true, planId, initialData: planId === null ? initialData : undefined }),
  closeInspector: () => set({ isOpen: false, planId: null, initialData: undefined }),
}))
