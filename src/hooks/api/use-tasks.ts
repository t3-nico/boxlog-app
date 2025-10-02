// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
/**
 * タスクAPI操作フック
 * tRPCを使用した型安全なタスク操作
 */

import { toast } from 'sonner'

import { trpc } from '@/lib/trpc/client'
import type {
  CreateTaskInput,
  UpdateTaskInput,
  DeleteTaskInput,
  SearchTasksInput,
  GetTasksInput,
  BulkUpdateTasksInput,
  Task,
} from '@/schemas/api/tasks'

/**
 * タスク作成フック
 */
export function useCreateTask() {
  const utils = trpc.useContext()

  return trpc.tasks.create.useMutation({
    onSuccess: (newTask) => {
      // キャッシュの更新
      utils.tasks.list.invalidate()

      toast.success('タスクを作成しました', {
        description: newTask.title,
      })
    },
    onError: (error) => {
      toast.error('タスクの作成に失敗しました', {
        description: error.message,
      })
    },
  })
}

/**
 * タスク更新フック
 */
export function useUpdateTask() {
  const utils = trpc.useContext()

  return trpc.tasks.update.useMutation({
    onSuccess: (updatedTask) => {
      // 特定のタスクキャッシュを更新
      utils.tasks.list.invalidate()

      // 完了ステータス変更時の特別な通知
      if (updatedTask.completed) {
        toast.success('タスクを完了しました！🎉', {
          description: updatedTask.title,
        })
      } else {
        toast.success('タスクを更新しました', {
          description: updatedTask.title,
        })
      }
    },
    onError: (error) => {
      toast.error('タスクの更新に失敗しました', {
        description: error.message,
      })
    },
    // 楽観的更新の実装
    onMutate: async (_updateData) => {
      // 進行中のクエリをキャンセル
      await utils.tasks.list.cancel()

      // 現在のキャッシュデータを取得
      const previousTasks = utils.tasks.list.getData()

      // 楽観的にキャッシュを更新
      if (previousTasks) {
        utils.tasks.list.setData(previousTasks, (old) => {
          if (!old) return old

          return {
            ...old,
            tasks: old.tasks.map((task) =>
              task.id === updateData.id
                ? {
                    ...task,
                    ...updateData,
                    updatedAt: new Date(),
                  }
                : task
            ),
          }
        })
      }

      // ロールバック用のデータを返す
      return { previousTasks }
    },
    onError: (error, updateData, context) => {
      // エラー時にキャッシュをロールバック
      if (context?.previousTasks) {
        utils.tasks.list.setData(context.previousTasks, context.previousTasks)
      }

      toast.error('タスクの更新に失敗しました', {
        description: error.message,
      })
    },
  })
}

/**
 * タスク削除フック
 */
export function useDeleteTask() {
  const utils = trpc.useContext()

  return trpc.tasks.delete.useMutation({
    onSuccess: (result, variables) => {
      utils.tasks.list.invalidate()

      toast.success('タスクを削除しました', {
        description: result.message,
      })
    },
    onError: (error) => {
      toast.error('タスクの削除に失敗しました', {
        description: error.message,
      })
    },
  })
}

/**
 * タスク一覧取得フック
 */
export function useTasksList(input?: GetTasksInput) {
  return trpc.tasks.list.useQuery(
    input || {
      page: 1,
      limit: 20,
    },
    {
      // キャッシュ時間の設定
      staleTime: 2 * 60 * 1000, // 2分
      cacheTime: 5 * 60 * 1000, // 5分

      // エラーハンドリング
      onError: (error) => {
        toast.error('タスク一覧の取得に失敗しました', {
          description: error.message,
        })
      },

      // データが存在する場合のみバックグラウンド更新
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    }
  )
}

/**
 * タスク検索フック
 */
export function useSearchTasks(input: SearchTasksInput) {
  return trpc.tasks.search.useQuery(input, {
    // 検索は即座に実行しない（手動トリガー）
    enabled: false,
    staleTime: 1 * 60 * 1000, // 1分

    onError: (error) => {
      toast.error('タスク検索に失敗しました', {
        description: error.message,
      })
    },
  })
}

/**
 * バルクタスク更新フック
 */
export function useBulkUpdateTasks() {
  const utils = trpc.useContext()

  return trpc.tasks.bulkUpdate.useMutation({
    onSuccess: (result) => {
      utils.tasks.list.invalidate()

      toast.success('タスクを一括更新しました', {
        description: result.message,
      })
    },
    onError: (error) => {
      toast.error('タスクの一括更新に失敗しました', {
        description: error.message,
      })
    },
  })
}

/**
 * タスク操作のヘルパーフック
 */
export function useTaskOperations() {
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const bulkUpdate = useBulkUpdateTasks()

  return {
    // 基本操作
    create: createTask,
    update: updateTask,
    delete: deleteTask,
    bulkUpdate,

    // 便利メソッド
    /**
     * タスクを完了状態に切り替え
     */
    toggleComplete: (task: Task) => {
      return updateTask.mutate({
        id: task.id,
        completed: !task.completed,
        progress: !task.completed ? 100 : task.progress,
        completedAt: !task.completed ? new Date() : undefined,
      })
    },

    /**
     * タスクの優先度を変更
     */
    changePriority: (taskId: string, priority: 'low' | 'medium' | 'high') => {
      return updateTask.mutate({
        id: taskId,
        priority,
      })
    },

    /**
     * タスクの進捗を更新
     */
    updateProgress: (taskId: string, progress: number) => {
      return updateTask.mutate({
        id: taskId,
        progress,
        completed: progress >= 100,
        completedAt: progress >= 100 ? new Date() : undefined,
      })
    },

    /**
     * 複数タスクの優先度を一括変更
     */
    bulkChangePriority: (taskIds: string[], priority: 'low' | 'medium' | 'high') => {
      return bulkUpdate.mutate({
        taskIds,
        updates: { priority },
      })
    },

    /**
     * 複数タスクを一括完了
     */
    bulkComplete: (taskIds: string[]) => {
      return bulkUpdate.mutate({
        taskIds,
        updates: {
          completed: true,
          progress: 100,
          completedAt: new Date(),
        },
      })
    },

    // ローディング状態
    isLoading:
      createTask.isLoading ||
      updateTask.isLoading ||
      deleteTask.isLoading ||
      bulkUpdate.isLoading,

    // エラー状態
    error: createTask.error || updateTask.error || deleteTask.error || bulkUpdate.error,
  }
}

/**
 * タスクキャッシュ操作フック
 */
export function useTaskCache() {
  const utils = trpc.useContext()

  return {
    /**
     * タスク一覧キャッシュを無効化
     */
    invalidateList: () => utils.tasks.list.invalidate(),

    /**
     * 特定条件のタスク一覧を無効化
     */
    invalidateListByCondition: (input?: GetTasksInput) => {
      utils.tasks.list.invalidate(input)
    },

    /**
     * 検索結果キャッシュを無効化
     */
    invalidateSearch: () => utils.tasks.search.invalidate(),

    /**
     * 全タスク関連キャッシュを無効化
     */
    invalidateAll: () => utils.tasks.invalidate(),

    /**
     * タスク一覧に新しいタスクを楽観的に追加
     */
    addOptimisticTask: (newTask: Task) => {
      utils.tasks.list.setData(undefined, (old) => {
        if (!old) return old

        return {
          ...old,
          tasks: [newTask, ...old.tasks],
          stats: old.stats
            ? {
                ...old.stats,
                total: old.stats.total + 1,
                todo: old.stats.todo + 1,
              }
            : undefined,
        }
      })
    },

    /**
     * タスク一覧から指定タスクを楽観的に削除
     */
    removeOptimisticTask: (taskId: string) => {
      utils.tasks.list.setData(undefined, (old) => {
        if (!old) return old

        const removedTask = old.tasks.find((task) => task.id === taskId)

        return {
          ...old,
          tasks: old.tasks.filter((task) => task.id !== taskId),
          stats: old.stats && removedTask
            ? {
                ...old.stats,
                total: old.stats.total - 1,
                [removedTask.status]: Math.max(0, old.stats[removedTask.status] - 1),
              }
            : old.stats,
        }
      })
    },
  }
}