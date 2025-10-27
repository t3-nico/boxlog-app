// Tag型定義

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  description?: string
  created_at: string
  updated_at: string
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
