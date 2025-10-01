/**
 * 統一された型定義
 * 重複する型定義をここで統一し、他のファイルから参照する
 */

import type { Tag } from './tags'

// === 基本的な型定義 ===
// TaskStatus, TaskPriority, Task等の基本型は src/types/index.ts に統一
// ここでは再エクスポートのみ
import type { Task, TaskStatus, TaskPriority } from './index'

export type { Task, TaskStatus, TaskPriority }

// === API関連 ===

export interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  planned_start: string
  planned_duration: number
  tags?: string[]
  smart_folder_id?: string
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string
  status?: TaskStatus
}

// === エラーハンドリング ===

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
  success: boolean
}

// === 共通のユーティリティ型 ===

export type WithTimestamps<T> = T & {
  created_at: string
  updated_at: string
}

export type WithUserId<T> = T & {
  user_id: string
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// === 再エクスポート（統一のため） ===

// tags.tsから最新の定義を再エクスポート
export type { CreateTagInput, Tag, TagLevel, TagWithChildren, UpdateTagInput } from './tags'

// smart-folders.tsから最新の定義を再エクスポート
export type { CreateSmartFolderInput, SmartFolder, SmartFolderRule } from './smart-folders'

// events型定義を直接インポート（循環依存を避けるため）
export type {
  CalendarEvent,
  CreateEventRequest,
  Event,
  EventEntity,
  UpdateEventRequest,
} from '@/features/events/types/events'
