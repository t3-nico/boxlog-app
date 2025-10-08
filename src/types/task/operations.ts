/**
 * タスク操作関連の型定義
 *
 * フィルター、ソート、クエリ、統計情報などの操作型
 */

import type { Task, TaskPriority, TaskStatus } from '../index'
import type { TaskType } from './core'

/**
 * タスクフィルターの条件
 */
export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  type?: TaskType[]
  assignee?: string[]
  reporter?: string[]
  createdBy?: string[]
  tags?: string[]
  labels?: string[]
  projects?: string[]
  sprints?: string[]
  epics?: string[]

  // 日付範囲
  createdAfter?: string
  createdBefore?: string
  dueAfter?: string
  dueBefore?: string
  updatedAfter?: string
  updatedBefore?: string

  // 検索
  query?: string

  // 特殊条件
  hasAttachments?: boolean
  hasComments?: boolean
  isOverdue?: boolean
  isBlocked?: boolean
  hasSubtasks?: boolean
}

/**
 * タスクソートの条件
 */
export interface TaskSort {
  field: keyof Pick<Task, 'title' | 'status' | 'priority' | 'created_at' | 'updated_at'>
  direction: 'asc' | 'desc'
}

/**
 * タスク一覧のクエリ条件
 */
export interface TaskQuery {
  filters?: TaskFilters
  sort?: TaskSort[]
  page?: number
  limit?: number
  include?: Array<'comments' | 'attachments' | 'timeEntries' | 'labels' | 'subtasks' | 'parentTask' | 'relatedTasks'>
}

/**
 * タスク一覧のレスポンス
 */
export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * タスク統計情報
 */
export interface TaskStats {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  byType: Record<TaskType, number>
  byAssignee: Record<string, number>

  // 時間統計
  totalEstimatedHours: number
  totalActualHours: number
  averageCompletionTime: number // 日単位

  // 期限統計
  overdue: number
  dueSoon: number // 7日以内
  noDueDate: number

  // 進捗統計
  completionRate: number // 完了率（%）
  activeTasksCount: number
  blockedTasksCount: number
}
