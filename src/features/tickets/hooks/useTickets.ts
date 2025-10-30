import { api } from '@/lib/trpc'
import type { TicketFilters } from '../types/ticket'

/**
 * チケット一覧取得フック
 * @description tRPC Query を使用してチケット一覧を取得
 * @param filters - フィルター条件（status, priority, search, sortBy, sortOrder, limit, offset）
 * @param options - React Query オプション
 */
export function useTickets(filters?: TicketFilters, options?: { enabled?: boolean }) {
  return api.tickets.list.useQuery(filters, {
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    ...options,
  })
}
