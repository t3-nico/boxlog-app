// SessionRecord型定義（将来拡張用）
// 注: TypeScript組み込みのRecord型との衝突を避けるため、SessionRecordという名前を使用

export interface SessionRecord {
  id: string
  user_id: string
  session_id: string
  record_type: string
  content: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreateSessionRecordInput {
  session_id: string
  record_type: string
  content: string
  metadata?: Record<string, unknown>
}

export interface UpdateSessionRecordInput {
  record_type?: string
  content?: string
  metadata?: Record<string, unknown>
}
