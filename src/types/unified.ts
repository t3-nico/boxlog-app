/**
 * 統一された型定義
 * 重複する型定義をここで統一し、他のファイルから参照する
 */

// === 基本的な型定義 ===
// TaskStatus, TaskPriority, Task等の基本型は src/types/index.ts に統一
// ここでは再エクスポートのみ
import type { Task, TaskPriority, TaskStatus } from './index'

export type { Task, TaskPriority, TaskStatus }

// === API関連 ===

export interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  planned_start: string
  planned_duration: number
  tags?: string[]
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

// 注: events型定義は削除済み（plans機能に移行）
// src/features/plans/types/plan.tsを使用してください

// 注: smart-folders型定義は削除済み
