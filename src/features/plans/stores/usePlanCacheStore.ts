import { create } from 'zustand'

/**
 * plan キャッシュストア
 *
 * TanStack Queryのキャッシュを補完し、複数コンポーネント間でのリアルタイム同期を実現
 *
 * 用途:
 * - recurrence_type / recurrence_rule の即座の同期
 * - Card、Inspector、Tableが同時に開いている場合の状態管理
 * - mutation実行中フラグ管理（Realtime二重更新防止）
 */

interface planCache {
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null
  recurrence_rule?: string | null
}

interface planCacheState {
  // チケットID → キャッシュデータのマップ
  cache: Record<string, planCache>

  // キャッシュ更新
  updateCache: (planId: string, data: planCache) => void

  // キャッシュ取得
  getCache: (planId: string) => planCache | undefined

  // キャッシュクリア
  clearCache: (planId: string) => void

  // mutation実行中フラグ（Realtime二重更新防止用）
  isMutating: boolean
  setIsMutating: (value: boolean) => void
}

export const usePlanCacheStore = create<planCacheState>((set, get) => ({
  cache: {},
  isMutating: false,

  updateCache: (planId, data) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [planId]: {
          ...state.cache[planId],
          ...data,
        },
      },
    })),

  getCache: (planId) => get().cache[planId],

  clearCache: (planId) =>
    set((state) => {
      const newCache = { ...state.cache }
      delete newCache[planId]
      return { cache: newCache }
    }),

  setIsMutating: (value) => set({ isMutating: value }),
}))

// Backward compatibility
export { usePlanCacheStore as useplanCacheStore }
