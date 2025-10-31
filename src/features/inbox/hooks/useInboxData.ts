/**
 * Inbox用データ取得フック
 * Board/Table共通のデータフェッチングhooks
 * TanStack Query統合済み
 */

import type { Ticket, TicketStatus } from '@/features/tickets/types/ticket'
import { cacheStrategies } from '@/lib/tanstack-query/cache-config'
import { api } from '@/lib/trpc'

/**
 * Inboxアイテム（Ticket型のエイリアス）
 */
export interface InboxItem {
  id: string
  type: 'ticket'
  title: string
  status: TicketStatus
  created_at: string
  updated_at: string
  ticket_number?: string
  planned_hours?: number
  description?: string
  due_date?: string | null // 期限日（YYYY-MM-DD）
  start_time?: string | null // 開始時刻（ISO 8601）
  end_time?: string | null // 終了時刻（ISO 8601）
  tags?: Array<{ id: string; name: string; color?: string }> // タグ情報
}

/**
 * Inboxフィルター型
 */
export interface InboxFilters {
  status?: TicketStatus
  search?: string
}

/**
 * TicketをInboxItemに変換
 */
function ticketToInboxItem(ticket: Ticket): InboxItem {
  return {
    id: ticket.id,
    type: 'ticket',
    title: ticket.title,
    status: ticket.status,
    created_at: ticket.created_at ?? new Date().toISOString(),
    updated_at: ticket.updated_at ?? new Date().toISOString(),
    ticket_number: ticket.ticket_number,
    description: ticket.description ?? undefined,
    due_date: ticket.due_date,
    start_time: ticket.start_time,
    end_time: ticket.end_time,
    tags: 'tags' in ticket ? (ticket as { tags: Array<{ id: string; name: string; color?: string }> }).tags : undefined,
  }
}

/**
 * Inbox用データ取得フック
 * Board/Table共通のデータを取得
 *
 * @param filters - フィルター条件
 * @returns Inboxアイテム、ローディング状態、エラー情報
 *
 * @example
 * ```tsx
 * const { items, isLoading, error } = useInboxData({ status: 'open' })
 *
 * if (isLoading) return <div>Loading...</div>
 * if (error) return <div>Error: {error.message}</div>
 *
 * return (
 *   <div>
 *     {items.map(item => (
 *       <div key={item.id}>{item.title}</div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export function useInboxData(filters: InboxFilters = {}) {
  // Ticketsの取得
  const {
    data: ticketsData,
    isLoading,
    error,
  } = api.tickets.list.useQuery(
    {
      status: filters.status,
      search: filters.search,
    },
    cacheStrategies.inbox
  )

  // TicketをInboxItemに変換
  // APIレスポンスは部分的な型なので、unknown経由でキャスト
  const items: InboxItem[] = ticketsData?.map((t) => ticketToInboxItem(t as unknown as Ticket)) || []

  // 更新日時の降順でソート
  items.sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  return {
    items,
    tickets: ticketsData || [],
    isLoading,
    error,
  }
}

/**
 * Tickets専用データ取得フック
 * useInboxDataのエイリアス
 *
 * @param filters - フィルター条件
 * @returns Ticketsデータ
 */
export function useInboxTickets(filters: InboxFilters = {}) {
  return useInboxData(filters)
}
