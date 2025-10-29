/**
 * Inbox用データ取得フック
 * Board/Table共通のデータフェッチングhooks
 * TanStack Query統合済み
 */

import type { Session, SessionStatus } from '@/features/tickets/types/session'
import type { Ticket, TicketPriority, TicketStatus } from '@/features/tickets/types/ticket'
import { cacheStrategies } from '@/lib/tanstack-query/cache-config'
import { api } from '@/lib/trpc'

/**
 * Inboxアイテム（TicketとSessionの統合型）
 */
export interface InboxItem {
  id: string
  type: 'ticket' | 'session'
  title: string
  status: TicketStatus | SessionStatus
  priority?: TicketPriority
  created_at: string
  updated_at: string
  // Ticket固有
  ticket_number?: string
  planned_hours?: number
  actual_hours?: number
  // Session固有
  ticket_id?: string
  session_number?: string
  planned_start?: string
  planned_end?: string
  actual_start?: string
  actual_end?: string
  duration_minutes?: number
}

/**
 * Inboxフィルター型
 */
export interface InboxFilters {
  status?: TicketStatus | SessionStatus
  priority?: TicketPriority
  search?: string
  type?: 'ticket' | 'session' | 'all'
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
    actual_hours: ticket.actual_hours,
  }
}

/**
 * SessionをInboxItemに変換
 */
function sessionToInboxItem(session: Session): InboxItem {
  return {
    id: session.id,
    type: 'session',
    title: session.title,
    status: session.status,
    created_at: session.created_at,
    updated_at: session.updated_at,
    ticket_id: session.ticket_id,
    session_number: session.session_number,
    planned_start: session.planned_start,
    planned_end: session.planned_end,
    actual_start: session.actual_start,
    actual_end: session.actual_end,
    duration_minutes: session.duration_minutes,
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
  const { type = 'all', ...restFilters } = filters

  // Ticketsの取得
  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    error: ticketsError,
  } = api.tickets.list.useQuery(
    {
      status: restFilters.status as TicketStatus | undefined,
      priority: restFilters.priority,
      search: restFilters.search,
    },
    {
      ...cacheStrategies.inbox,
      enabled: type === 'all' || type === 'ticket',
    }
  )

  // Sessionsの取得
  // 注: sessionFilterSchemaにはsearchフィールドがないため、statusのみでフィルタリング
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = api.tickets.sessions.list.useQuery(
    {
      status: restFilters.status as SessionStatus | undefined,
    },
    {
      ...cacheStrategies.inbox,
      enabled: type === 'all' || type === 'session',
    }
  )

  // ローディング状態の統合
  const isLoading = isLoadingTickets || isLoadingSessions

  // エラーの統合
  const error = ticketsError || sessionsError

  // データの統合とソート
  const items: InboxItem[] = []

  if (type === 'all' || type === 'ticket') {
    const ticketItems = ticketsData?.map(ticketToInboxItem) || []
    items.push(...ticketItems)
  }

  if (type === 'all' || type === 'session') {
    const sessionItems = sessionsData?.map(sessionToInboxItem) || []
    items.push(...sessionItems)
  }

  // 更新日時の降順でソート
  items.sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  return {
    items,
    tickets: ticketsData || [],
    sessions: sessionsData || [],
    isLoading,
    error,
  }
}

/**
 * Tickets専用データ取得フック
 * useInboxDataのラッパー
 *
 * @param filters - フィルター条件
 * @returns Ticketsデータ
 */
export function useInboxTickets(filters: Omit<InboxFilters, 'type'> = {}) {
  const result = useInboxData({ ...filters, type: 'ticket' })

  return {
    tickets: result.tickets,
    isLoading: result.isLoading,
    error: result.error,
  }
}

/**
 * Sessions専用データ取得フック
 * useInboxDataのラッパー
 *
 * @param filters - フィルター条件
 * @returns Sessionsデータ
 */
export function useInboxSessions(filters: Omit<InboxFilters, 'type'> = {}) {
  const result = useInboxData({ ...filters, type: 'session' })

  return {
    sessions: result.sessions,
    isLoading: result.isLoading,
    error: result.error,
  }
}
