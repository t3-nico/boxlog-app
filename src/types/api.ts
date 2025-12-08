/**
 * API共通型定義
 *
 * APIリクエスト/レスポンスで使用される共通型
 */

import type { TaskPriority, TaskStatus } from './index'

// ============================================
// リクエスト型
// ============================================

/**
 * タスク作成リクエスト
 */
export interface CreateTaskRequest {
  title: string
  description?: string
  priority: TaskPriority
  planned_start: string
  planned_duration: number
  tags?: string[]
}

/**
 * タスク更新リクエスト
 */
export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string
  status?: TaskStatus
}

// ============================================
// レスポンス型
// ============================================

/**
 * APIエラー
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

/**
 * API共通レスポンス
 */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
  success: boolean
}

// ============================================
// ページネーション
// ============================================

/**
 * ページネーションパラメータ
 */
export interface PaginationParams {
  page: number
  limit: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/**
 * ページネーション付きレスポンス
 */
export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================
// ユーティリティ型
// ============================================

/**
 * タイムスタンプ付き型
 */
export type WithTimestamps<T> = T & {
  created_at: string
  updated_at: string
}

/**
 * ユーザーID付き型
 */
export type WithUserId<T> = T & {
  user_id: string
}

/**
 * 特定フィールドをオプショナルにする
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 特定フィールドを必須にする
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
