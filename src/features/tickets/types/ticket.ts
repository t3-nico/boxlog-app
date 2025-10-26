// Ticket型定義

export type TicketStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low'

export interface Ticket {
  id: string
  user_id: string
  ticket_number: string
  title: string
  description?: string
  status: TicketStatus
  priority?: TicketPriority
  planned_hours?: number
  actual_hours: number
  created_at: string
  updated_at: string
}

export interface CreateTicketInput {
  title: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  planned_hours?: number
}

export interface UpdateTicketInput {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  planned_hours?: number
}

export interface TicketWithTags extends Ticket {
  tags: Array<{ id: string; name: string; color: string }>
}
