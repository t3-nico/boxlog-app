/**
 * 共通型定義
 *
 * アプリケーション全体で使用される基本的な型定義
 * 重複する型定義は unified.ts に移行しています
 */

// 統一された型定義を再エクスポート
export type {
  ApiError,
  ApiResponse,
  CreateTaskRequest,
  SmartFolder,
  SmartFolderRule,
  Tag,
  TagWithChildren,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskRequest,
} from './unified'

// TaskTypeはtask/core.tsから再エクスポート
export type { TaskType } from './task/core'

// 検索可能な共通インターフェース
export interface Searchable {
  id: string
  title?: string
  name?: string
  description?: string
  tags?: import('./unified').Tag[]
  createdAt?: Date
  updatedAt?: Date
  [key: string]: unknown
}

// オフライン同期関連の型
export interface OfflineActionData<T = unknown> {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'task' | 'record' | 'block' | 'tag' | 'smart-folder'
  data: T
  originalData?: T
  timestamp: Date
  userId?: string
}

export interface ConflictData<T = unknown> {
  localData: T
  serverData: T
  localTimestamp: Date
  serverTimestamp: Date
  field: string
  conflictType: 'value_mismatch' | 'delete_conflict' | 'parent_conflict'
}

// ユーザー関連の型
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at?: Date
  updated_at?: Date
  settings?: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12' | '24'
  firstDayOfWeek: number
  notifications?: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  inApp: boolean
  desktop: boolean
  taskReminders: boolean
  dueDateAlerts: boolean
  tagUpdates: boolean
}

// レガシー型定義を削除しました
// 新しいコードでは unified.ts の ApiResponse, ApiError を使用してください
// または src/lib/api/error-handler.ts の APIResponse を使用してください

// ページネーション関連の型
export interface PaginationParams {
  page: number
  limit: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

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

// フィルター関連の型
export interface FilterOptions {
  tags?: string[]
  status?: import('./unified').TaskStatus[]
  priority?: import('./unified').TaskPriority[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
  assignedTo?: string[]
  projectId?: string[]
}

// 汎用的なエンティティ型（検索・フィルタリング用）
export interface BaseEntity {
  id: string
  createdAt?: Date
  updatedAt?: Date
  name?: string
  title?: string
  description?: string
  tags?: import('./unified').Tag[]
  status?: string
  priority?: string
  isFavorite?: boolean
  [key: string]: unknown
}
