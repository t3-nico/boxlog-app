import { cacheStrategies } from '@/lib/tanstack-query/cache-config'
import { api } from '@/lib/trpc'
import type { PlanFilters } from '../types/plan'

/**
 * プラン一覧取得フック
 * @description tRPC Query を使用してプラン一覧を取得
 * @param filters - フィルター条件（status, priority, search, sortBy, sortOrder, limit, offset）
 * @param options - React Query オプション
 *
 * @remarks
 * リアルタイム性を重視した設定（業界標準準拠）:
 * - staleTime: 30秒 → 30秒以内のタブ切り替えでは再フェッチをスキップ（UX向上）
 * - refetchOnWindowFocus: true（グローバル設定で有効）→ staleなデータのみ再フェッチ
 * - gcTime: 2分 → メモリからの削除は遅らせてローディング状態を回避
 *
 * @see {@link cacheStrategies.plans} - realtimeCache設定を使用
 */
export function usePlans(filters?: PlanFilters, options?: { enabled?: boolean }) {
  return api.plans.list.useQuery(filters, {
    ...cacheStrategies.plans, // staleTime: 30秒, gcTime: 2分
    retry: 1,
    ...options,
  })
}

// 互換性のためのエイリアス
/** @deprecated Use usePlans instead */
export const useTickets = usePlans

// Backward compatibility
export { usePlans as useTickets }
