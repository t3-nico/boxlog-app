// Ticket型定義

/**
 * チケットステータス（6段階）
 * - backlog: 準備中（未着手）
 * - ready: 配置済み（準備完了、開始待ち）
 * - active: 作業中
 * - wait: 待ち（ブロック中）
 * - done: 完了
 * - cancel: 中止
 */
export type TicketStatus = 'backlog' | 'ready' | 'active' | 'wait' | 'done' | 'cancel'

/**
 * 繰り返しタイプ
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

/**
 * チケット基本型（データベーススキーマに対応）
 */
export interface Ticket {
  id: string
  user_id: string
  ticket_number: string
  title: string
  description: string | null
  status: TicketStatus
  due_date: string | null // DATE型（YYYY-MM-DD）
  start_time: string | null // TIMESTAMPTZ型（ISO 8601）
  end_time: string | null // TIMESTAMPTZ型（ISO 8601）
  recurrence_type: RecurrenceType | null
  recurrence_end_date: string | null // DATE型（YYYY-MM-DD）
  created_at: string | null
  updated_at: string | null
}

/**
 * チケット作成入力（schemas/tickets/ticket.ts の CreateTicketInput と一致）
 */
export interface CreateTicketInput {
  title: string
  description?: string
  status: TicketStatus
  due_date?: string // YYYY-MM-DD形式
  start_time?: string // ISO 8601形式
  end_time?: string // ISO 8601形式
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string // YYYY-MM-DD形式
}

/**
 * チケット更新入力（schemas/tickets/ticket.ts の UpdateTicketInput と一致）
 */
export interface UpdateTicketInput {
  title?: string
  description?: string
  status?: TicketStatus
  due_date?: string // YYYY-MM-DD形式
  start_time?: string // ISO 8601形式
  end_time?: string // ISO 8601形式
  recurrence_type?: RecurrenceType
  recurrence_end_date?: string // YYYY-MM-DD形式
}

/**
 * タグ付きチケット（リレーション取得時）
 */
export interface TicketWithTags extends Ticket {
  tags: Array<{ id: string; name: string; color: string; description?: string }>
}

/**
 * フィルター条件
 */
export interface TicketFilters {
  status?: TicketStatus
  search?: string
  sortBy?: 'created_at' | 'updated_at' | 'due_date' | 'title'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * 統計情報
 */
export interface TicketStats {
  total: number
  byStatus: Record<string, number>
}
