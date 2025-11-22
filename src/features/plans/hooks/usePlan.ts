import { cacheStrategies } from '@/lib/tanstack-query/cache-config'
import { api } from '@/lib/trpc'

/**
 * 単一チケット取得フック
 * @description tRPC Query を使用してチケットを ID で取得
 * @param id - チケットID
 * @param options - オプション（tags: true でタグも取得）
 *
 * @remarks
 * リアルタイム性を重視した設定（業界標準準拠）:
 * - staleTime: 30秒 → 30秒以内のタブ切り替えでは再フェッチをスキップ（UX向上）
 * - refetchOnWindowFocus: true（グローバル設定で有効）→ staleなデータのみ再フェッチ
 * - gcTime: 2分 → メモリからの削除は遅らせてローディング状態を回避
 *
 * @see {@link cacheStrategies.tickets} - realtimeCache設定を使用
 */
export function useTicket(id: string, options?: { includeTags?: boolean; enabled?: boolean }) {
  return api.tickets.getById.useQuery(
    {
      id,
      include: options?.includeTags ? { tags: true } : undefined,
    },
    {
      ...cacheStrategies.tickets, // staleTime: 30秒, gcTime: 2分
      retry: 1,
      enabled: options?.enabled ?? true,
    }
  )
}
