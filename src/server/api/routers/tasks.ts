/**
 * タスク管理tRPCルーター
 * 型安全なタスクCRUD操作とビジネスルール適用
 */

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { trackError, trackTaskCompleted, trackTaskCreated } from '@/lib/analytics/vercel-analytics'
import {
  bulkUpdateTasksInputSchema,
  createTaskInputSchema,
  deleteTaskInputSchema,
  getTasksInputSchema,
  searchTasksInputSchema,
  taskOutputSchema,
  tasksListOutputSchema,
  updateTaskInputSchema,
  type Task,
} from '@/schemas/api/tasks'
import { createTRPCRouter, protectedProcedure } from '../trpc'

/**
 * タスクルーター
 */
export const tasksRouter = createTRPCRouter({
  /**
   * タスク作成
   */
  create: protectedProcedure
    .input(createTaskInputSchema)
    .output(taskOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const startTime = Date.now()

        // データベースに保存（仮実装）
        const task: Task = {
          id: crypto.randomUUID(),
          ...input,
          status: 'todo',
          completed: false,
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: ctx.userId,
          updatedBy: ctx.userId,
          version: 1,
        }

        // 実際のデータベース保存処理をここに実装
        // await db.task.create({ data: task })

        // Analytics追跡
        trackTaskCreated({
          priority: task.priority,
          hasDescription: !!task.description,
          hasDueDate: !!task.dueDate,
          projectId: task.projectId,
        })

        const duration = Date.now() - startTime
        console.log(`Task created in ${duration}ms`)

        return task
      } catch (error) {
        trackError({
          errorCode: 500,
          errorCategory: 'API',
          severity: 'high',
          wasRecovered: false,
        })

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスクの作成に失敗しました',
          cause: createAppError('タスク作成エラー', ERROR_CODES.INTERNAL_SERVER_ERROR, {
            source: 'tasks_router',
            userId: ctx.userId,
            operation: 'create',
          }),
        })
      }
    }),

  /**
   * タスク更新
   */
  update: protectedProcedure
    .input(updateTaskInputSchema)
    .output(taskOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input

        // 既存タスクの確認
        const existingTask = await findTaskById(id)
        if (!existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'タスクが見つかりません',
            cause: createAppError('タスクが見つかりません', ERROR_CODES.NOT_FOUND, {
              source: 'tasks_router',
              userId: ctx.userId,
              taskId: id,
            }),
          })
        }

        // 権限チェック
        if (existingTask.createdBy !== ctx.userId && !(await isUserAdmin(ctx.userId))) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '他のユーザーのタスクは編集できません',
            cause: createAppError('権限不足', ERROR_CODES.NO_PERMISSION, {
              source: 'tasks_router',
              userId: ctx.userId,
              taskId: id,
            }),
          })
        }

        // 完了チェックとAnalytics
        const wasCompleted = existingTask.completed
        const isNowCompleted = updateData.completed ?? existingTask.completed

        if (!wasCompleted && isNowCompleted) {
          const timeToComplete = existingTask.createdAt
            ? Math.round((Date.now() - existingTask.createdAt.getTime()) / (1000 * 60)) // 分単位
            : undefined

          trackTaskCompleted({
            timeToComplete,
            priority: existingTask.priority,
            hadDescription: !!existingTask.description,
          })
        }

        // タスク更新
        const updatedTask: Task = {
          ...existingTask,
          ...updateData,
          updatedAt: new Date(),
          updatedBy: ctx.userId,
          version: existingTask.version + 1,
          completedAt: isNowCompleted && !wasCompleted ? new Date() : existingTask.completedAt,
        }

        // データベース更新（仮実装）
        // await db.task.update({ where: { id }, data: updatedTask })

        return updatedTask
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        trackError({
          errorCode: 500,
          errorCategory: 'API',
          severity: 'high',
          wasRecovered: false,
        })

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスクの更新に失敗しました',
          cause: createAppError('タスク更新エラー', ERROR_CODES.INTERNAL_SERVER_ERROR, {
            source: 'tasks_router',
            userId: ctx.userId,
            operation: 'update',
          }),
        })
      }
    }),

  /**
   * タスク削除
   */
  delete: protectedProcedure
    .input(deleteTaskInputSchema)
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, force } = input

        const task = await findTaskById(id)
        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'タスクが見つかりません',
            cause: createAppError('タスクが見つかりません', ERROR_CODES.NOT_FOUND, {
              source: 'tasks_router',
              userId: ctx.userId,
              taskId: id,
            }),
          })
        }

        // 権限チェック
        if (task.createdBy !== ctx.userId && !(await isUserAdmin(ctx.userId))) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '他のユーザーのタスクは削除できません',
            cause: createAppError('権限不足', ERROR_CODES.NO_PERMISSION, {
              source: 'tasks_router',
              userId: ctx.userId,
              taskId: id,
            }),
          })
        }

        // サブタスクがある場合の確認
        if (!force && (await hasSubtasks(id))) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'サブタスクがあるため削除できません。強制削除するか、先にサブタスクを削除してください。',
            cause: createAppError('削除条件不足', ERROR_CODES.DATA_VALIDATION_ERROR, {
              source: 'tasks_router',
              userId: ctx.userId,
              taskId: id,
            }),
          })
        }

        // タスク削除（実際はソフトデリート推奨）
        // await db.task.update({ where: { id }, data: { deletedAt: new Date() } })

        return {
          success: true,
          message: 'タスクを削除しました',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        trackError({
          errorCode: 500,
          errorCategory: 'API',
          severity: 'high',
          wasRecovered: false,
        })

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスクの削除に失敗しました',
          cause: createAppError('タスク削除エラー', ERROR_CODES.INTERNAL_SERVER_ERROR, {
            source: 'tasks_router',
            userId: ctx.userId,
            operation: 'delete',
          }),
        })
      }
    }),

  /**
   * タスク一覧取得
   */
  list: protectedProcedure
    .input(getTasksInputSchema)
    .output(tasksListOutputSchema)
    .query(async ({ input }) => {
      try {
        const { page, limit } = input

        // データベースクエリ（仮実装）
        const tasks: Task[] = []
        const total = 0
        const totalPages = Math.ceil(total / limit)

        // 統計情報の計算
        const stats = {
          total: tasks.length,
          completed: tasks.filter((t) => t.completed).length,
          inProgress: tasks.filter((t) => t.status === 'in_progress').length,
          todo: tasks.filter((t) => t.status === 'todo').length,
          overdue: tasks.filter((t) => t.dueDate && t.dueDate < new Date() && !t.completed).length,
          byPriority: {
            high: tasks.filter((t) => t.priority === 'high').length,
            medium: tasks.filter((t) => t.priority === 'medium').length,
            low: tasks.filter((t) => t.priority === 'low').length,
          },
          completionRate: tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0,
        }

        return {
          tasks,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
          },
          stats,
        }
      } catch (error) {
        trackError({
          errorCode: 500,
          errorCategory: 'API',
          severity: 'medium',
          wasRecovered: false,
        })

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスク一覧の取得に失敗しました',
          cause: createAppError('タスク一覧取得エラー', ERROR_CODES.INTERNAL_SERVER_ERROR, {
            source: 'tasks_router',
            userId: ctx.userId,
            operation: 'list',
          }),
        })
      }
    }),

  /**
   * タスク検索
   */
  search: protectedProcedure
    .input(searchTasksInputSchema)
    .output(tasksListOutputSchema)
    .query(async ({ input }) => {
      try {
        // 検索クエリの構築と実行
        const tasks: Task[] = []
        const total = 0

        return {
          tasks,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
            hasNext: input.page < Math.ceil(total / input.limit),
            hasPrevious: input.page > 1,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスク検索に失敗しました',
        })
      }
    }),

  /**
   * バルク更新
   */
  bulkUpdate: protectedProcedure
    .input(bulkUpdateTasksInputSchema)
    .output(
      z.object({
        updatedCount: z.number(),
        success: z.boolean(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { taskIds } = input

        // 権限チェック・バルク更新処理
        // 実装省略

        return {
          updatedCount: taskIds.length,
          success: true,
          message: `${taskIds.length}件のタスクを更新しました`,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスクの一括更新に失敗しました',
        })
      }
    }),
})

/**
 * ヘルパー関数
 */

async function findTaskById(_id: string): Promise<Task | null> {
  // データベースからタスクを取得（仮実装）
  return null
}

async function isUserAdmin(_userId: string): Promise<boolean> {
  // ユーザーの管理者権限確認（仮実装）
  return false
}

async function hasSubtasks(_taskId: string): Promise<boolean> {
  // サブタスクの存在確認（仮実装）
  return false
}
