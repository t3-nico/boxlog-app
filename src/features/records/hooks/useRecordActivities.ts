import { useActivityRealtimeSync } from '@/hooks/useActivityRealtimeSync';
import { getCacheStrategy } from '@/lib/tanstack-query/cache-config';
import { api } from '@/lib/trpc';
import { getQueryKey } from '@trpc/react-query';

/**
 * createActivityRouter で動的生成されたルーターの型推論が不完全なため、
 * useQuery の最小限インターフェースを定義。
 * any ではなく unknown[] ベースで data 型を制約する。
 */
interface ActivityQueryResult {
  data: unknown[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

interface ActivityRouterProxy {
  useQuery: (input: unknown, options: unknown) => ActivityQueryResult;
}

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

  const activitiesProxy = api.records.activities as unknown as ActivityRouterProxy;
  const query = activitiesProxy.useQuery(input, {
    retry: 1,
    refetchOnWindowFocus: false,
    ...getCacheStrategy('recordActivities'),
    enabled,
  });

  useActivityRealtimeSync({
    entityId: recordId,
    channelPrefix: 'record-activities',
    table: 'record_activities',
    filterColumn: 'record_id',
    queryKey: getQueryKey(
      api.records.activities as Parameters<typeof getQueryKey>[0],
      input,
      'query',
    ),
    order,
    enabled,
  });

  return query;
}
