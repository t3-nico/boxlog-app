// Session型定義

export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export interface Session {
  id: string
  user_id: string
  ticket_id: string
  session_number: string
  title: string
  planned_start?: string
  planned_end?: string
  actual_start?: string
  actual_end?: string
  status: SessionStatus
  duration_minutes?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateSessionInput {
  ticket_id: string
  title: string
  planned_start?: string
  planned_end?: string
  notes?: string
}

export interface UpdateSessionInput {
  title?: string
  planned_start?: string
  planned_end?: string
  actual_start?: string
  actual_end?: string
  status?: SessionStatus
  notes?: string
}

export interface SessionWithTags extends Session {
  tags: Array<{ id: string; name: string; color: string }>
}
