/**
 * Inbox用データ取得フック
 * Board/Table共通のデータフェッチングhooks
 * TanStack Query統合済み
 */

import type { Ticket, TicketPriority, TicketStatus } from '@/features/tickets/types/ticket'
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
  priority?: TicketPriority
  created_at: string
  updated_at: string
  ticket_number?: string
  planned_hours?: number
  description?: string
}

/**
 * Inboxフィルター型
 */
export interface InboxFilters {
  status?: TicketStatus
  priority?: TicketPriority
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
    priority: ticket.priority,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
    ticket_number: ticket.ticket_number,
    planned_hours: ticket.planned_hours,
    description: ticket.description,
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
      priority: filters.priority,
      search: filters.search,
    },
    cacheStrategies.inbox
  )

  // TicketをInboxItemに変換
  const items: InboxItem[] = ticketsData?.map(ticketToInboxItem) || []

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
