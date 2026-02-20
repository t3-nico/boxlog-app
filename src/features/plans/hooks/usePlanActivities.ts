import { useActivityRealtimeSync } from '@/hooks/useActivityRealtimeSync';
import { getCacheStrategy } from '@/lib/tanstack-query/cache-config';
import { api } from '@/lib/trpc';
import { getQueryKey } from '@trpc/react-query';

/**
 * プランアクティビティ（変更履歴）取得フック
 * Supabase Realtimeでリアルタイム更新に対応
 */
export function usePlanActivities(
  planId: string,
  options?: {
    limit?: number;
    offset?: number;
    order?: 'asc' | 'desc';
    enabled?: boolean;
  },
) {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const order = options?.order ?? 'desc';
  const enabled = options?.enabled ?? true;

  const input = { plan_id: planId, limit, offset, order };

  const query = api.plans.activities.useQuery(input, {
    retry: 1,
    refetchOnWindowFocus: false,
    ...getCacheStrategy('planActivities'),
    enabled,
  });

  useActivityRealtimeSync({
    entityId: planId,
    channelPrefix: 'plan-activities',
    table: 'plan_activities',
    filterColumn: 'plan_id',
    queryKey: getQueryKey(api.plans.activities, input, 'query'),
    order,
    enabled,
  });

  return query;
}

// Backward compatibility
export { usePlanActivities as useplanActivities };
