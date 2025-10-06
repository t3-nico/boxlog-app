/**
 * タスク関連の基本型定義
 *
 * 基本型（TaskStatus, TaskPriority, Task）は src/types/index.ts に統一
 * ここでは詳細な拡張型のみ定義
 */

import type { TaskStatus, TaskPriority, Task as BaseTask } from '../index'

// 基本型を再エクスポート
export type { TaskStatus, TaskPriority }
export type Task = BaseTask

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
