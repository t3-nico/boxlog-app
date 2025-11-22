import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/trpc'
import type { Database } from '@/types/supabase'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect } from 'react'
import type { PlanActivity } from '../types/activity'

/**
 * プランアクティビティ（変更履歴）取得フック
 * Supabase Realtimeでリアルタイム更新に対応
 *
 * @param planId - プランID
 * @param options - オプション
 * @returns アクティビティ一覧とローディング状態
 */
export function usePlanActivities(
  planId: string,
  options?: {
    limit?: number
    offset?: number
    order?: 'asc' | 'desc' // asc=古い順, desc=最新順
    enabled?: boolean
  }
) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const query = api.plans.activities.useQuery(
    {
      ticket_id: planId,
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
      order: options?.order ?? 'desc',
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1分間キャッシュ
      enabled: options?.enabled ?? true,
    }
  )

  // Supabase Realtimeでリアルタイム更新を購読
  useEffect(() => {
    if (!planId || options?.enabled === false) return

    const channel = supabase
      .channel(`ticket-activities:${planId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_activities',
          filter: `ticket_id=eq.${planId}`,
        },
        (payload: RealtimePostgresInsertPayload<Database['public']['Tables']['ticket_activities']['Row']>) => {
          // 新しいアクティビティを追加（order に応じて先頭 or 末尾）
          const queryKey = getQueryKey(
            api.plans.activities,
            {
              ticket_id: planId,
              limit: options?.limit ?? 50,
              offset: options?.offset ?? 0,
              order: options?.order ?? 'desc',
            },
            'query'
          )

          const order = options?.order ?? 'desc'
          queryClient.setQueryData<PlanActivity[]>(queryKey, (oldData) => {
            if (!oldData) return [payload.new as PlanActivity]
            // desc（最新順）なら先頭に追加、asc（古い順）なら末尾に追加
            return order === 'desc'
              ? [payload.new as PlanActivity, ...oldData]
              : [...oldData, payload.new as PlanActivity]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [planId, options?.enabled, options?.limit, options?.offset, options?.order, queryClient, supabase])

  return query
}
