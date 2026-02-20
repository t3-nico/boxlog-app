import type { Database } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

type ActivityTable = 'plan_activities' | 'record_activities';
type ActivityRow<T extends ActivityTable> = Database['public']['Tables'][T]['Row'];

interface UseActivityRealtimeSyncOptions<T extends ActivityTable> {
  /** エンティティID（planId または recordId） */
  entityId: string;
  /** Supabase Realtime チャンネル名プレフィックス */
  channelPrefix: string;
  /** 購読するテーブル名 */
  table: T;
  /** フィルタ対象のカラム名（例: 'plan_id'） */
  filterColumn: string;
  /** TanStack Query のクエリキー */
  queryKey: readonly unknown[];
  /** ソート順（desc = 先頭追加、asc = 末尾追加） */
  order: 'asc' | 'desc';
  /** 購読を有効にするか */
  enabled: boolean;
}

/**
 * アクティビティテーブルの Realtime INSERT を購読し、キャッシュを即時更新するフック
 *
 * Plan/Record 共通で使用。tRPC クエリは呼び出し元が管理し、
 * このフックは Realtime → キャッシュ同期のみを担当する。
 */
export function useActivityRealtimeSync<T extends ActivityTable>({
  entityId,
  channelPrefix,
  table,
  filterColumn,
  queryKey,
  order,
  enabled,
}: UseActivityRealtimeSyncOptions<T>) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!entityId || !enabled) return;

    const channel = supabase
      .channel(`${channelPrefix}:${entityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `${filterColumn}=eq.${entityId}`,
        },
        (payload: RealtimePostgresInsertPayload<ActivityRow<T>>) => {
          queryClient.setQueryData<ActivityRow<T>[]>(queryKey, (oldData) => {
            if (!oldData) return [payload.new];
            return order === 'desc' ? [payload.new, ...oldData] : [...oldData, payload.new];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    entityId,
    enabled,
    channelPrefix,
    table,
    filterColumn,
    queryKey,
    order,
    queryClient,
    supabase,
  ]);
}
