import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/trpc'
import type { Database } from '@/types/supabase'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect } from 'react'
import type { TicketActivity } from '../types/activity'

/**
 * チケットアクティビティ（変更履歴）取得フック
 * Supabase Realtimeでリアルタイム更新に対応
 *
 * @param ticketId - チケットID
 * @param options - オプション
 * @returns アクティビティ一覧とローディング状態
 */
export function useTicketActivities(
  ticketId: string,
  options?: {
    limit?: number
    offset?: number
    order?: 'asc' | 'desc' // asc=古い順, desc=最新順
    enabled?: boolean
  }
) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const query = api.tickets.activities.useQuery(
    {
      ticket_id: ticketId,
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
    if (!ticketId || options?.enabled === false) return

    const channel = supabase
      .channel(`ticket-activities:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_activities',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload: RealtimePostgresInsertPayload<Database['public']['Tables']['ticket_activities']['Row']>) => {
          // 新しいアクティビティを追加（order に応じて先頭 or 末尾）
          const queryKey = getQueryKey(
            api.tickets.activities,
            {
              ticket_id: ticketId,
              limit: options?.limit ?? 50,
              offset: options?.offset ?? 0,
              order: options?.order ?? 'desc',
            },
            'query'
          )

          const order = options?.order ?? 'desc'
          queryClient.setQueryData<TicketActivity[]>(queryKey, (oldData) => {
            if (!oldData) return [payload.new as TicketActivity]
            // desc（最新順）なら先頭に追加、asc（古い順）なら末尾に追加
            return order === 'desc'
              ? [payload.new as TicketActivity, ...oldData]
              : [...oldData, payload.new as TicketActivity]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, options?.enabled, options?.limit, options?.offset, options?.order, queryClient, supabase])

  return query
}
