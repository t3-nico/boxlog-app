import { useCallback } from 'react'
import useCalendarToast from './index'
import { handleNetworkError } from './network-handler'

// 楽観的更新の結果
export interface OptimisticUpdateResult<T> {
  success: boolean
  data?: T
  error?: any
}

// 楽観的更新のオプション
export interface OptimisticUpdateOptions {
  // 成功時のメッセージ
  successMessage?: string
  // エラー時のメッセージ
  errorMessage?: string
  // エラー時にカスタムハンドリングを行うか
  customErrorHandling?: boolean
  // 再試行機能を提供するか
  enableRetry?: boolean
  // 操作の説明（ロールバック時に使用）
  operationDescription?: string
}

// 楽観的更新ユーティリティ関数
export const withOptimisticUpdate = async <T>(
  optimisticUpdate: () => void,
  actualUpdate: () => Promise<T>,
  rollback: () => void,
  options: OptimisticUpdateOptions = {}
): Promise<OptimisticUpdateResult<T>> => {
  const {
    successMessage,
    errorMessage,
    customErrorHandling = false,
    enableRetry = true,
    operationDescription = '操作'
  } = options

  // 楽観的更新を実行
  optimisticUpdate()

  try {
    // 実際の更新を実行
    const result = await actualUpdate()
    
    // 成功メッセージを表示（オプション）
    if (successMessage) {
      const toast = useCalendarToast()
      toast.success(successMessage)
    }

    return { success: true, data: result }
  } catch (error) {
    // ロールバック実行
    rollback()

    // カスタムエラーハンドリングが無効な場合は自動でエラー表示
    if (!customErrorHandling) {
      if (enableRetry) {
        // 再試行機能付きエラー表示
        handleNetworkError(error, async () => {
          // 再試行時は再度楽観的更新から実行
          return withOptimisticUpdate(optimisticUpdate, actualUpdate, rollback, {
            ...options,
            enableRetry: false // 再試行の無限ループを防ぐ
          })
        })
      } else {
        // 通常のエラー表示
        handleNetworkError(error)
      }
    }

    return { success: false, error }
  }
}

// Reactフック版の楽観的更新
export const useOptimisticUpdate = () => {
  const toast = useCalendarToast()

  const execute = useCallback(async <T>(
    optimisticUpdate: () => void,
    actualUpdate: () => Promise<T>,
    rollback: () => void,
    options: OptimisticUpdateOptions = {}
  ) => {
    return withOptimisticUpdate(optimisticUpdate, actualUpdate, rollback, options)
  }, [])

  // イベント移動に特化したヘルパー
  const moveEvent = useCallback(async <T>(
    eventId: string,
    newData: Partial<T>,
    originalData: Partial<T>,
    updateFunction: (id: string, data: Partial<T>) => Promise<T>,
    optimisticUpdateUI: (id: string, data: Partial<T>) => void
  ) => {
    return execute(
      () => optimisticUpdateUI(eventId, newData),
      () => updateFunction(eventId, newData),
      () => optimisticUpdateUI(eventId, originalData),
      {
        operationDescription: '予定の移動',
        enableRetry: true
      }
    )
  }, [execute])

  // イベント削除に特化したヘルパー
  const deleteEvent = useCallback(async <T>(
    eventId: string,
    eventData: T,
    deleteFunction: (id: string) => Promise<void>,
    optimisticRemoveUI: (id: string) => void,
    optimisticRestoreUI: (data: T) => void,
    undoAction?: () => Promise<void>
  ) => {
    const result = await execute(
      () => optimisticRemoveUI(eventId),
      () => deleteFunction(eventId),
      () => optimisticRestoreUI(eventData),
      {
        operationDescription: '予定の削除',
        customErrorHandling: false,
        enableRetry: false // 削除操作は通常再試行しない
      }
    )

    // 削除成功時はアンドゥ付きToastを表示
    if (result.success && undoAction) {
      toast.eventDeleted(eventData as any, undoAction)
    }

    return result
  }, [execute, toast])

  // イベント作成に特化したヘルパー
  const createEvent = useCallback(async <T>(
    tempId: string,
    eventData: T,
    createFunction: (data: T) => Promise<T>,
    optimisticAddUI: (tempId: string, data: T) => void,
    optimisticRemoveUI: (tempId: string) => void,
    optimisticUpdateUI?: (tempId: string, realData: T) => void
  ) => {
    const result = await execute(
      () => optimisticAddUI(tempId, eventData),
      async () => {
        const realEvent = await createFunction(eventData)
        // 成功時は一時IDを実際のIDに置換
        if (optimisticUpdateUI) {
          optimisticUpdateUI(tempId, realEvent)
        }
        return realEvent
      },
      () => optimisticRemoveUI(tempId),
      {
        operationDescription: '予定の作成',
        enableRetry: true
      }
    )

    // 作成成功時はToastを表示
    if (result.success && result.data) {
      toast.eventCreated(result.data as any)
    }

    return result
  }, [execute, toast])

  return {
    execute,
    moveEvent,
    deleteEvent,
    createEvent
  }
}

// バッチ操作用のユーティリティ
export interface BatchOperation<T> {
  id: string
  operation: () => Promise<T>
  optimisticUpdate: () => void
  rollback: () => void
  description?: string
}

export const executeBatchOperations = async <T>(
  operations: BatchOperation<T>[],
  options: {
    onProgress?: (completed: number, total: number) => void
    onPartialFailure?: (successes: T[], failures: { id: string; error: any }[]) => void
    concurrency?: number
  } = {}
): Promise<{ successes: T[]; failures: { id: string; error: any }[] }> => {
  const { onProgress, onPartialFailure, concurrency = 3 } = options
  const toast = useCalendarToast()
  
  const successes: T[] = []
  const failures: { id: string; error: any }[] = []

  // 全ての楽観的更新を先に実行
  operations.forEach(op => op.optimisticUpdate())

  // 指定された同時実行数で処理
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency)
    
    const promises = batch.map(async (op) => {
      try {
        const result = await op.operation()
        successes.push(result)
        return { success: true, id: op.id, result }
      } catch (error) {
        // 失敗した操作はロールバック
        op.rollback()
        failures.push({ id: op.id, error })
        return { success: false, id: op.id, error }
      }
    })

    await Promise.all(promises)
    
    // 進捗報告
    if (onProgress) {
      onProgress(Math.min(i + concurrency, operations.length), operations.length)
    }
  }

  // 結果の通知
  if (failures.length === 0) {
    toast.success(`${successes.length}件の操作が完了しました`)
  } else if (successes.length === 0) {
    toast.error(`${failures.length}件の操作が失敗しました`)
  } else {
    toast.warning(`${successes.length}件成功、${failures.length}件失敗`)
    
    if (onPartialFailure) {
      onPartialFailure(successes, failures)
    }
  }

  return { successes, failures }
}