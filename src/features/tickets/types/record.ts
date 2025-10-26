// Record型定義（将来拡張用）

export interface Record {
  id: string
  user_id: string
  session_id: string
  record_type: string
  content: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreateRecordInput {
  session_id: string
  record_type: string
  content: string
  metadata?: Record<string, unknown>
}

export interface UpdateRecordInput {
  record_type?: string
  content?: string
  metadata?: Record<string, unknown>
}
