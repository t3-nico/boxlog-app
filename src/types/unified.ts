/**
 * 統一された型定義
 * 重複する型定義をここで統一し、他のファイルから参照する
 */

// === 基本的な型定義 ===

export type TaskStatus = 'backlog' | 'scheduled' | 'completed' | 'rescheduled' | 'stopped' | 'delegated'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskType = 'task' | 'milestone' | 'meeting' | 'reminder'

// === Task関連 ===

export interface BaseTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  created_at: string
  updated_at: string
  due_date?: string
  completed_at?: string
  user_id: string
  tags?: string[]
  smart_folder_id?: string
}

// Supabaseデータベース形式（snake_case）
export interface TaskEntity extends BaseTask {
  // データベース固有のプロパティがあれば追加
}

// クライアント表示用（camelCase）
export interface Task extends Omit<BaseTask, 'user_id' | 'smart_folder_id'> {
  userId: string
  smartFolderId?: string
  tagObjects?: any[] // TODO: Fix after Tag type is properly imported
}

// === API関連 ===

export interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  type: TaskType
  due_date?: string
  tags?: string[]
  smart_folder_id?: string
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string
  status?: TaskStatus
  completed_at?: string
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
export type { Tag, TagWithChildren, CreateTagInput, UpdateTagInput, TagLevel } from './tags'

// smart-folders.tsから最新の定義を再エクスポート  
export type { SmartFolder, SmartFolderRule, CreateSmartFolderInput } from './smart-folders'

// events.tsから最新の定義を再エクスポート
export type { Event, EventEntity, CalendarEvent, CreateEventRequest, UpdateEventRequest } from '@/features/events'