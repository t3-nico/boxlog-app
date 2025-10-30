import { api } from '@/lib/trpc'

/**
 * 単一チケット取得フック
 * @description tRPC Query を使用してチケットを ID で取得
 * @param id - チケットID
 * @param options - オプション（tags: true でタグも取得）
 */
export function useTicket(id: string, options?: { includeTags?: boolean; enabled?: boolean }) {
  return api.tickets.getById.useQuery(
    {
      id,
      include: options?.includeTags ? { tags: true } : undefined,
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5分間キャッシュ
      enabled: options?.enabled ?? true,
    }
  )
}
