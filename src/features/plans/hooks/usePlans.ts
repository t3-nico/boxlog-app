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
 * リアルタイム性を最優先した設定:
 * - staleTime: 0 → 常にfresh状態（楽観的更新とRealtime購読による即座の反映）
 * - refetchOnWindowFocus: true（グローバル設定で有効）→ タブ切り替え時に再フェッチ
 * - gcTime: 2分 → メモリからの削除は遅らせてローディング状態を回避
 *
 * @see {@link cacheStrategies.plans} - realtimeCache設定を使用
 */
export function usePlans(filters?: PlanFilters, options?: { enabled?: boolean }) {
  return api.plans.list.useQuery(filters, {
    ...cacheStrategies.plans, // staleTime: 0, gcTime: 2分
    retry: 1,
    ...options,
  })
}

// Backward compatibility
export { usePlans as useplans }
