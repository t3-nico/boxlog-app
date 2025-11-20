import type { Ticket, TicketStatus, TicketWithTags } from '@/features/tickets/types/ticket'
import type { CalendarEvent } from '../types/calendar.types'

/**
 * TicketStatusをCalendarEventのstatusにマッピング
 */
function mapTicketStatusToCalendarStatus(ticketStatus: TicketStatus): CalendarEvent['status'] {
  const statusMap: Record<TicketStatus, CalendarEvent['status']> = {
    backlog: 'inbox',
    ready: 'planned',
    active: 'in_progress',
    wait: 'planned',
    done: 'completed',
    cancel: 'cancelled',
  }

  return statusMap[ticketStatus]
}

/**
 * TicketStatusに応じた色を返す
 */
function getColorForStatus(status: TicketStatus): string {
  const colorMap: Record<TicketStatus, string> = {
    backlog: 'hsl(var(--muted))',
    ready: 'hsl(var(--primary))',
    active: 'hsl(var(--chart-2))',
    wait: 'hsl(var(--chart-4))',
    done: 'hsl(var(--chart-3))',
    cancel: 'hsl(var(--muted))',
  }

  return colorMap[status]
}

/**
 * TicketをCalendarEventに変換
 *
 * @param ticket - 変換するTicket（タグ付きも対応）
 * @returns CalendarEvent
 *
 * @example
 * ```typescript
 * const ticket: TicketWithTags = {
 *   id: '123',
 *   title: 'ミーティング',
 *   start_time: '2025-11-20T10:00:00Z',
 *   end_time: '2025-11-20T11:00:00Z',
 *   status: 'ready',
 *   tags: [{ id: '1', name: '重要', color: '#ff0000' }],
 *   // ...
 * }
 *
 * const event = ticketToCalendarEvent(ticket)
 * // event.startDate: Date(2025-11-20 10:00)
 * // event.endDate: Date(2025-11-20 11:00)
 * // event.status: 'planned'
 * // event.tags: [{ id: '1', name: '重要', color: '#ff0000' }]
 * ```
 */
export function ticketToCalendarEvent(ticket: Ticket | TicketWithTags): CalendarEvent {
  const startDate = ticket.start_time ? new Date(ticket.start_time) : new Date()
  const endDate = ticket.end_time ? new Date(ticket.end_time) : new Date(startDate.getTime() + 60 * 60 * 1000) // デフォルト1時間後

  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)) // 分単位

  // タグ情報を変換（TicketWithTagsの場合）
  const tags = 'tags' in ticket && ticket.tags ? ticket.tags : undefined

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description ?? undefined,
    startDate,
    endDate,
    status: mapTicketStatusToCalendarStatus(ticket.status),
    color: getColorForStatus(ticket.status),
    tags, // タグ情報を追加
    createdAt: ticket.created_at ? new Date(ticket.created_at) : new Date(),
    updatedAt: ticket.updated_at ? new Date(ticket.updated_at) : new Date(),
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration,
    isMultiDay: false, // TODO: 複数日対応
    isRecurring: ticket.recurrence_type !== null && ticket.recurrence_type !== 'none',
  }
}

/**
 * Ticket配列をCalendarEvent配列に変換
 *
 * @param tickets - 変換するTicket配列（タグ付きも対応）
 * @returns CalendarEvent配列
 */
export function ticketsToCalendarEvents(tickets: (Ticket | TicketWithTags)[]): CalendarEvent[] {
  return tickets.map(ticketToCalendarEvent)
}
