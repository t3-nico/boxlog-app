/**
 * タスクAPI用Zodスキーマ定義
 * タスクCRUD操作の入出力型とバリデーション
 */

import { z } from 'zod'
import {
  idSchema,
  titleSchema,
  descriptionSchema,
  prioritySchema,
  statusSchema,
  dateSchema,
  futureDateSchema,
  metadataSchema,
  paginationInputSchema,
  paginationOutputSchema,
  searchInputSchema,
} from './common'

/**
 * タスク基本情報スキーマ
 */
export const taskBaseSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  dueDate: futureDateSchema.optional(),
  estimatedHours: z.number()
    .min(0.1, '見積時間は0.1時間以上を指定してください')
    .max(1000, '見積時間は1000時間以下を指定してください')
    .optional(),
  projectId: idSchema.optional(),
  assigneeId: idSchema.optional(),
  parentTaskId: idSchema.optional(),
  tags: z.array(idSchema).max(10, 'タグは10個まで設定できます').default([]),
})

/**
 * 完全なタスクスキーマ
 */
export const taskSchema = taskBaseSchema.extend({
  id: idSchema,
  completed: z.boolean().default(false),
  completedAt: dateSchema.optional(),
  actualHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).default(0),
  ...metadataSchema.shape,
})

/**
 * タスク作成入力スキーマ
 */
export const createTaskInputSchema = taskBaseSchema
  .omit({ status: true }) // 作成時はステータスを自動設定
  .extend({
    // 作成時の追加バリデーション
    dueDate: z.date()
      .min(new Date(), '期限は現在時刻以降を指定してください')
      .optional(),
  })
  .refine(
    (data) => {
      // 親タスクがある場合の追加チェック
      if (data.parentTaskId && !data.projectId) {
        return false
      }
      return true
    },
    {
      message: '親タスクがある場合はプロジェクトも指定してください',
      path: ['projectId'],
    }
  )

/**
 * タスク更新入力スキーマ
 */
export const updateTaskInputSchema = taskBaseSchema
  .partial() // すべてのフィールドを任意に
  .extend({
    id: idSchema,
    completed: z.boolean().optional(),
    progress: z.number().min(0).max(100).optional(),
    actualHours: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      // 完了時の必須チェック
      if (data.completed === true) {
        return data.progress === 100 || data.progress === undefined
      }
      return true
    },
    {
      message: '完了時は進捗を100%にしてください',
      path: ['progress'],
    }
  )
  .refine(
    (data) => {
      // 期限の妥当性チェック
      if (data.dueDate && data.dueDate < new Date()) {
        return false
      }
      return true
    },
    {
      message: '期限は現在時刻以降を指定してください',
      path: ['dueDate'],
    }
  )

/**
 * タスク削除入力スキーマ
 */
export const deleteTaskInputSchema = z.object({
  id: idSchema,
  force: z.boolean().default(false), // 強制削除フラグ
})

/**
 * タスク検索入力スキーマ
 */
export const searchTasksInputSchema = searchInputSchema.extend({
  status: z.array(statusSchema).optional(),
  priority: z.array(prioritySchema).optional(),
  projectId: idSchema.optional(),
  assigneeId: idSchema.optional(),
  tagIds: z.array(idSchema).optional(),
  dueDateFrom: dateSchema.optional(),
  dueDateTo: dateSchema.optional(),
  completed: z.boolean().optional(),
  hasSubtasks: z.boolean().optional(),
})

/**
 * タスク一覧取得スキーマ
 */
export const getTasksInputSchema = paginationInputSchema.extend({
  projectId: idSchema.optional(),
  status: statusSchema.optional(),
  assigneeId: idSchema.optional(),
})

/**
 * タスク統計スキーマ
 */
export const taskStatsSchema = z.object({
  total: z.number(),
  completed: z.number(),
  inProgress: z.number(),
  todo: z.number(),
  overdue: z.number(),
  byPriority: z.object({
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
  completionRate: z.number().min(0).max(100),
  averageCompletionTime: z.number().optional(), // 時間単位
})

/**
 * タスク履歴スキーマ
 */
export const taskHistorySchema = z.object({
  id: idSchema,
  taskId: idSchema,
  action: z.enum(['created', 'updated', 'completed', 'deleted', 'assigned', 'commented']),
  changes: z.record(z.object({
    from: z.any(),
    to: z.any(),
  })).optional(),
  comment: z.string().max(1000).optional(),
  userId: idSchema,
  createdAt: dateSchema,
})

/**
 * API出力スキーマ
 */
export const taskOutputSchema = taskSchema

export const tasksListOutputSchema = z.object({
  tasks: z.array(taskOutputSchema),
  pagination: paginationOutputSchema,
  stats: taskStatsSchema.optional(),
})

export const taskStatsOutputSchema = taskStatsSchema

export const taskHistoryOutputSchema = z.object({
  history: z.array(taskHistorySchema),
  pagination: paginationOutputSchema,
})

/**
 * バルク操作スキーマ
 */
export const bulkUpdateTasksInputSchema = z.object({
  taskIds: z.array(idSchema).min(1, '更新するタスクを選択してください').max(100, '一度に更新できるタスクは100件までです'),
  updates: taskBaseSchema
    .partial()
    .extend({
      completed: z.boolean().optional(),
      progress: z.number().min(0).max(100).optional(),
      actualHours: z.number().min(0).optional(),
    })
    .refine(
      (data) => {
        if (data.completed === true) {
          return data.progress === 100 || data.progress === undefined
        }
        return true
      },
      {
        message: '完了時は進捗を100%にしてください',
        path: ['progress'],
      }
    ),
})

export const bulkDeleteTasksInputSchema = z.object({
  taskIds: z.array(idSchema).min(1, '削除するタスクを選択してください').max(100, '一度に削除できるタスクは100件までです'),
  force: z.boolean().default(false),
})

/**
 * タスクインポート/エクスポートスキーマ
 */
export const importTasksInputSchema = z.object({
  tasks: z.array(createTaskInputSchema),
  projectId: idSchema.optional(),
  overwriteExisting: z.boolean().default(false),
})

export const exportTasksInputSchema = z.object({
  projectId: idSchema.optional(),
  status: z.array(statusSchema).optional(),
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  dateRange: z.object({
    from: dateSchema,
    to: dateSchema,
  }).optional(),
})

/**
 * 型エクスポート
 */
export type Task = z.infer<typeof taskSchema>
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>
export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>
export type SearchTasksInput = z.infer<typeof searchTasksInputSchema>
export type GetTasksInput = z.infer<typeof getTasksInputSchema>
export type TaskStats = z.infer<typeof taskStatsSchema>
export type TaskHistory = z.infer<typeof taskHistorySchema>
export type TasksListOutput = z.infer<typeof tasksListOutputSchema>
export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksInputSchema>
export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksInputSchema>
export type ImportTasksInput = z.infer<typeof importTasksInputSchema>
export type ExportTasksInput = z.infer<typeof exportTasksInputSchema>

/**
 * バリデーションヘルパー
 */
export function validateTaskTitle(title: string): boolean {
  return titleSchema.safeParse(title).success
}

export function validateTaskDueDate(dueDate: Date): boolean {
  return futureDateSchema.safeParse(dueDate).success
}

export function validateTaskProgress(progress: number): boolean {
  return z.number().min(0).max(100).safeParse(progress).success
}