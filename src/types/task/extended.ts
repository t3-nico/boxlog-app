/**
 * タスクの拡張型定義
 *
 * 詳細なプロジェクト管理機能のための拡張型
 */

import type { Task as BaseTask } from '../index'
import type { TaskAttachment, TaskComment, TaskLabel, TaskTimeEntry, TaskType } from './core'

/**
 * タスク拡張型（開発管理用の詳細情報を含む）
 * BaseTaskを拡張して詳細なプロジェクト管理機能を追加
 */
export interface TaskDetailed extends BaseTask {
  type: TaskType

  // 関係者
  createdBy: string
  assigneeId?: string
  reporterId?: string

  // 時間関連（BaseTaskの基本時間フィールドに追加）
  dueDate?: string
  startDate?: string
  completedAt?: string

  // 推定・実績工数（時間単位）
  estimatedHours?: number
  actualHours?: number

  // 組織
  projectId?: string
  sprintId?: string
  epicId?: string

  // 分類（BaseTaskのtagsに追加）
  labels?: TaskLabel[]

  // 関連
  parentTaskId?: string
  subtaskIds?: string[]
  blockedBy?: string[]
  blocks?: string[]
  relatedTasks?: string[]

  // 添付・コメント
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  timeEntries?: TaskTimeEntry[]

  // カスタムフィールド
  customFields?: Record<string, unknown>

  // メタデータ
  version?: number
  isArchived?: boolean
  isDeleted?: boolean
}

/**
 * タスク作成時の入力データ（詳細版）
 */
export type CreateTaskDetailedInput = Omit<
  TaskDetailed,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'version'
  | 'comments'
  | 'attachments'
  | 'timeEntries'
  | 'isArchived'
  | 'isDeleted'
>

/**
 * タスク更新時の入力データ（詳細版）
 */
export type UpdateTaskDetailedInput = Partial<Omit<TaskDetailed, 'id' | 'created_at' | 'createdBy' | 'version'>>

/**
 * タスクボードのカラム設定
 */
export interface TaskBoardColumn {
  id: string
  name: string
  status: import('../index').TaskStatus[]
  color?: string
  order: number
  limit?: number // WIP制限
}

/**
 * タスクボードの設定
 */
export interface TaskBoard {
  id: string
  name: string
  description?: string
  projectId?: string
  columns: TaskBoardColumn[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * タスクテンプレート
 */
export interface TaskTemplate {
  id: string
  name: string
  description?: string
  defaultTitle: string
  defaultDescription?: string
  defaultType: TaskType
  defaultPriority: import('../index').TaskPriority
  defaultTags?: string[]
  defaultEstimatedHours?: number
  customFields?: Record<string, any>
  createdBy: string
  createdAt: string
  isPublic: boolean
}
