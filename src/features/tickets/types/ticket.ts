// Ticket型定義

export type TicketStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Ticket {
  id: string
  user_id: string
  ticket_number: string
  title: string
  description?: string
  status: TicketStatus
  priority?: TicketPriority
  milestone?: string
  due_date?: string
  start_time?: string
  end_time?: string
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string
  created_at: string
  updated_at: string
}

export interface CreateTicketInput {
  title: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  milestone?: string
  due_date?: string
  start_time?: string
  end_time?: string
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string
}

export interface UpdateTicketInput {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  milestone?: string
  due_date?: string
  start_time?: string
  end_time?: string
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string
}

export interface TicketWithTags extends Ticket {
  tags: Array<{ id: string; name: string; color: string }>
}
