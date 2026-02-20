import { useActivityRealtimeSync } from '@/hooks/useActivityRealtimeSync';
import { getCacheStrategy } from '@/lib/tanstack-query/cache-config';
import { api } from '@/lib/trpc';
import { getQueryKey } from '@trpc/react-query';

/**
 * Recordアクティビティ（変更履歴）取得フック
 * Supabase Realtimeでリアルタイム更新に対応
 */
export function useRecordActivities(
  recordId: string,
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

  const input = { record_id: recordId, limit, offset, order };

  const query = api.records.activities.useQuery(input, {
    retry: 1,
    refetchOnWindowFocus: false,
    ...getCacheStrategy('planActivities'),
    enabled,
  });

  useActivityRealtimeSync({
    entityId: recordId,
    channelPrefix: 'record-activities',
    table: 'record_activities',
    filterColumn: 'record_id',
    queryKey: getQueryKey(api.records.activities, input, 'query'),
    order,
    enabled,
  });

  return query;
}
