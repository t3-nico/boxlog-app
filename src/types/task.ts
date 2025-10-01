/**
 * タスク関連の型定義
 *
 * 基本型（TaskStatus, TaskPriority, Task）は src/types/index.ts に統一
 * ここでは詳細な拡張型のみ定義
 */

import type { TaskStatus, TaskPriority, Task as BaseTask } from './index'

// 基本型を再エクスポート
export type { TaskStatus, TaskPriority }

/**
 * タスクの種別（開発管理用の詳細タイプ）
 */
export type TaskType = 'feature' | 'bug' | 'improvement' | 'maintenance' | 'documentation'

/**
 * タスクのラベル
 */
export interface TaskLabel {
  id: string
  name: string
  color: string
  description?: string
}

/**
 * タスクのコメント
 */
export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
}

/**
 * タスクの添付ファイル
 */
export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy: string
  uploadedAt: string
}

/**
 * タスクの時間追跡
 */
export interface TaskTimeEntry {
  id: string
  taskId: string
  userId: string
  description?: string
  startTime: string
  endTime?: string
  duration?: number // 秒単位
  createdAt: string
}

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
export type UpdateTaskDetailedInput = Partial<
  Omit<TaskDetailed, 'id' | 'created_at' | 'createdBy' | 'version'>
>

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
  field: keyof Pick<
    Task,
    | 'title'
    | 'status'
    | 'priority'
    | 'type'
    | 'createdAt'
    | 'updatedAt'
    | 'dueDate'
    | 'startDate'
    | 'completedAt'
    | 'estimatedHours'
    | 'actualHours'
  >
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
  include?: Array<
    | 'comments'
    | 'attachments'
    | 'timeEntries'
    | 'labels'
    | 'subtasks'
    | 'parentTask'
    | 'relatedTasks'
  >
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

/**
 * タスクの変更履歴
 */
export interface TaskHistory {
  id: string
  taskId: string
  userId: string
  action: 'created' | 'updated' | 'commented' | 'attached' | 'status_changed' | 'assigned'
  field?: string
  oldValue?: any
  newValue?: any
  description?: string
  createdAt: string
}

/**
 * タスクボードのカラム設定
 */
export interface TaskBoardColumn {
  id: string
  name: string
  status: TaskStatus[]
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
  defaultPriority: TaskPriority
  defaultTags?: string[]
  defaultEstimatedHours?: number
  customFields?: Record<string, any>
  createdBy: string
  createdAt: string
  isPublic: boolean
}