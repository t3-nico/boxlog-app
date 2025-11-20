import { create } from 'zustand'

/**
 * Ticket キャッシュストア
 *
 * TanStack Queryのキャッシュを補完し、複数コンポーネント間でのリアルタイム同期を実現
 *
 * 用途:
 * - recurrence_type / recurrence_rule の即座の同期
 * - Card、Inspector、Tableが同時に開いている場合の状態管理
 */

interface TicketCache {
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null
  recurrence_rule?: string | null
}

interface TicketCacheState {
  // チケットID → キャッシュデータのマップ
  cache: Record<string, TicketCache>

  // キャッシュ更新
  updateCache: (ticketId: string, data: TicketCache) => void

  // キャッシュ取得
  getCache: (ticketId: string) => TicketCache | undefined

  // キャッシュクリア
  clearCache: (ticketId: string) => void
}

export const useTicketCacheStore = create<TicketCacheState>((set, get) => ({
  cache: {},

  updateCache: (ticketId, data) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [ticketId]: {
          ...state.cache[ticketId],
          ...data,
        },
      },
    })),

  getCache: (ticketId) => get().cache[ticketId],

  clearCache: (ticketId) =>
    set((state) => {
      const newCache = { ...state.cache }
      delete newCache[ticketId]
      return { cache: newCache }
    }),
}))
