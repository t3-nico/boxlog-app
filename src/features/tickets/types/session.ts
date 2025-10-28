// Session型定義

export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

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
  reminder_minutes?: number // 何分前にリマインドするか
  recurrence_type?: RecurrenceType // 繰り返しタイプ
  recurrence_end_date?: string // 繰り返し終了日
  parent_session_id?: string // 繰り返しの親Session
  created_at: string
  updated_at: string
}

export interface CreateSessionInput {
  ticket_id: string
  title: string
  planned_start?: string
  planned_end?: string
  notes?: string
  reminder_minutes?: number
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string
}

export interface UpdateSessionInput {
  title?: string
  planned_start?: string
  planned_end?: string
  actual_start?: string
  actual_end?: string
  status?: SessionStatus
  notes?: string
  reminder_minutes?: number
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string
}

export interface SessionWithTags extends Session {
  tags: Array<{ id: string; name: string; color: string }>
}
