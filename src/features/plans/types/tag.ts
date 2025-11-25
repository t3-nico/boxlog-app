// Tag型定義（データベーススキーマに対応）

export interface Tag {
  id: string
  user_id: string | null
  name: string
  color: string
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface CreateTagInput {
  name: string
  color?: string
  description?: string
}

export interface UpdateTagInput {
  name?: string
  color?: string
  description?: string
}
