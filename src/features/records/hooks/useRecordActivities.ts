import type { Database } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { getCacheStrategy } from '@/lib/tanstack-query/cache-config';
import { api } from '@/lib/trpc';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useEffect } from 'react';

import type { RecordActivity } from '../types/activity';

/**
 * Recordアクティビティ（変更履歴）取得フック
 * Supabase Realtimeでリアルタイム更新に対応
 *
 * @param recordId - RecordID
 * @param options - オプション
 * @returns アクティビティ一覧とローディング状態
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
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = api.records.activities.useQuery(
    {
      record_id: recordId,
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
      order: options?.order ?? 'desc',
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      ...getCacheStrategy('planActivities'), // 同じキャッシュ戦略を使用
      enabled: options?.enabled ?? true,
    },
  );

  // Supabase Realtimeでリアルタイム更新を購読
  useEffect(() => {
    if (!recordId || options?.enabled === false) return;

    const channel = supabase
      .channel(`record-activities:${recordId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'record_activities',
          filter: `record_id=eq.${recordId}`,
        },
        (
          payload: RealtimePostgresInsertPayload<
            Database['public']['Tables']['record_activities']['Row']
          >,
        ) => {
          // 新しいアクティビティを追加（order に応じて先頭 or 末尾）
          const queryKey = getQueryKey(
            api.records.activities,
            {
              record_id: recordId,
              limit: options?.limit ?? 50,
              offset: options?.offset ?? 0,
              order: options?.order ?? 'desc',
            },
            'query',
          );

          const order = options?.order ?? 'desc';
          queryClient.setQueryData<RecordActivity[]>(queryKey, (oldData) => {
            if (!oldData) return [payload.new as RecordActivity];
            // desc（最新順）なら先頭に追加、asc（古い順）なら末尾に追加
            return order === 'desc'
              ? [payload.new as RecordActivity, ...oldData]
              : [...oldData, payload.new as RecordActivity];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    recordId,
    options?.enabled,
    options?.limit,
    options?.offset,
    options?.order,
    queryClient,
    supabase,
  ]);

  return query;
}
