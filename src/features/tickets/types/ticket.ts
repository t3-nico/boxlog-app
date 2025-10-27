// Ticket型定義

export type TicketStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export interface Ticket {
  id: string
  user_id: string
  ticket_number: string
  title: string
  description?: string
  status: TicketStatus
  milestone?: string
  actual_hours: number
  created_at: string
  updated_at: string
}

export interface CreateTicketInput {
  title: string
  description?: string
  status?: TicketStatus
  milestone?: string
}

export interface UpdateTicketInput {
  title?: string
  description?: string
  status?: TicketStatus
  milestone?: string
}

export interface TicketWithTags extends Ticket {
  tags: Array<{ id: string; name: string; color: string }>
}
