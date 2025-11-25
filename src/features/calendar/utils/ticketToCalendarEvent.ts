import type { Ticket, TicketStatus, TicketWithTags } from '@/features/tickets/types/ticket'
import type { CalendarEvent } from '../types/calendar.types'
import { parseDatetimeString } from './dateUtils'

// グローバル変数でユーザーのタイムゾーン設定を保持（後でContextから取得するように改善）
let userTimezone: string | undefined

export function setUserTimezone(timezone: string) {
  userTimezone = timezone
}

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
  // ユーザー設定のタイムゾーンでUTC時刻を解釈
  const startDate = ticket.start_time ? parseDatetimeString(ticket.start_time, userTimezone) : new Date()
  const endDate = ticket.end_time
    ? parseDatetimeString(ticket.end_time, userTimezone)
    : new Date(startDate.getTime() + 60 * 60 * 1000) // デフォルト1時間後

  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)) // 分単位

  // デバッグログ
  if (ticket.id === '73a64deb-d41f-4f9e-ba4b-07fae568563f') {
    console.log('[ticketToCalendarEvent] チケット#1 変換:', {
      ticketId: ticket.id,
      userTimezone,
      start_time_db: ticket.start_time,
      end_time_db: ticket.end_time,
      startDate_local: startDate.toLocaleString('ja-JP'),
      endDate_local: endDate.toLocaleString('ja-JP'),
      startDate_iso: startDate.toISOString(),
      endDate_iso: endDate.toISOString(),
    })
  }

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
    ticket_number: ticket.ticket_number, // チケット番号を追加
    reminder_minutes: ticket.reminder_minutes, // 通知設定を追加
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
