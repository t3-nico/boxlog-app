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

  // Type assertion: createActivityRouter で動的生成されたルーターの型推論が不完全なため
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (api.records.activities as any).useQuery(input, {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryKey: getQueryKey(api.records.activities as any, input, 'query'),
    order,
    enabled,
  });

  return query;
}
