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
          // 新しいアクティビティを先頭に追加
          const queryKey = getQueryKey(
            api.tickets.activities,
            {
              ticket_id: ticketId,
              limit: options?.limit ?? 50,
              offset: options?.offset ?? 0,
            },
            'query'
          )

          queryClient.setQueryData<TicketActivity[]>(queryKey, (oldData) => {
            if (!oldData) return [payload.new as TicketActivity]
            return [payload.new as TicketActivity, ...oldData]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, options?.enabled, options?.limit, options?.offset, queryClient, supabase])

  return query
}
