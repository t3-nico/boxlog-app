import { useCallback } from 'react'

import { useNetworkErrorHandler } from './network-handler'

import { useCalendarToast } from './use-calendar-toast'

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

// 楽観的更新のカスタムフック
export const useOptimisticUpdate = () => {
  const toast = useCalendarToast()
  const { handleError } = useNetworkErrorHandler()

  const withOptimisticUpdate = useCallback(async <T>(
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
        toast.success(successMessage)
      }

      return { success: true, data: result }
    } catch (error) {
      // ロールバック実行
      rollback()

      // カスタムエラーハンドリングが無効な場合は自動でエラー表示
      if (!customErrorHandling) {
        if (errorMessage) {
          toast.error(errorMessage)
        } else {
          // ネットワークエラーハンドリングを使用
          handleError(error, enableRetry ? () => {
            // 再試行時は再度楽観的更新から実行
            withOptimisticUpdate(optimisticUpdate, actualUpdate, rollback, options)
          } : undefined)
        }
      }

      return { success: false, error }
    }
  }, [toast, handleError])

  return { withOptimisticUpdate }
}

// バッチ操作用のインターfaces
interface BatchOperation<T> {
  operation: () => Promise<T>
  optimisticUpdate?: () => void
  rollback?: () => void
  description?: string
}

interface BatchOperationResult<T> {
  success: boolean
  results: T[]
  errors: any[]
}

// バッチ操作実行のカスタムフック
export const useBatchOperations = () => {
  const toast = useCalendarToast()
  const { handleError } = useNetworkErrorHandler()

  const executeBatchOperations = useCallback(async <T>(
    operations: BatchOperation<T>[],
    options: {
      showProgress?: boolean
      successMessage?: string
      partialSuccessMessage?: string
      errorMessage?: string
    } = {}
  ): Promise<BatchOperationResult<T>> => {
    const { showProgress = false, successMessage, partialSuccessMessage, errorMessage } = options
    
    const results: T[] = []
    const errors: any[] = []
    const rollbacks: Array<() => void> = []

    // 楽観的更新を一括実行
    operations.forEach((op, index) => {
      if (op.optimisticUpdate) {
        op.optimisticUpdate()
        if (op.rollback) {
          rollbacks[index] = op.rollback
        }
      }
    })

    // プログレスToastを表示（オプション）
    let progressToastId: string | undefined
    if (showProgress) {
      progressToastId = toast.loading(`${operations.length}件の操作を実行中...`, {
        duration: Infinity
      })
    }

    try {
      // 全ての操作を並列実行
      const promises = operations.map(async (op, index) => {
        try {
          const result = await op.operation()
          results[index] = result
          return { success: true, result, index }
        } catch (error) {
          errors[index] = error
          // 対応するロールバックを実行
          if (rollbacks[index]) {
            rollbacks[index]()
          }
          return { success: false, error, index }
        }
      })

      await Promise.allSettled(promises)

      // プログレスToastを閉じる
      if (progressToastId) {
        toast.dismiss(progressToastId)
      }

      // 結果に応じてメッセージを表示
      const successCount = results.filter(r => r !== undefined).length
      const errorCount = errors.filter(e => e !== undefined).length

      if (errorCount === 0 && successMessage) {
        toast.success(successMessage)
      } else if (successCount > 0 && errorCount > 0 && partialSuccessMessage) {
        toast.warning(partialSuccessMessage.replace('{success}', String(successCount)).replace('{total}', String(operations.length)))
      } else if (errorCount > 0) {
        if (errorMessage) {
          toast.error(errorMessage)
        } else {
          toast.error(`${errorCount}件の操作が失敗しました`)
        }
      }

      return {
        success: errorCount === 0,
        results,
        errors
      }
    } catch (error) {
      // プログレスToastを閉じる
      if (progressToastId) {
        toast.dismiss(progressToastId)
      }

      // 全てのロールバックを実行
      rollbacks.forEach(rollback => {
        if (rollback) rollback()
      })

      handleError(error)

      return {
        success: false,
        results,
        errors: [error]
      }
    }
  }, [toast, handleError])

  return { executeBatchOperations }
}

// 結果をマージする関数
export const mergeOptimisticResults = <T>(
  results: OptimisticUpdateResult<T>[]
): OptimisticUpdateResult<T[]> => {
  const successfulResults = results.filter(r => r.success).map(r => r.data!).filter(Boolean)
  const errors = results.filter(r => !r.success).map(r => r.error).filter(Boolean)

  return {
    success: errors.length === 0,
    data: successfulResults,
    error: errors.length > 0 ? errors : undefined
  }
}

// 操作のキューイング（順次実行）
export const useQueuedOperations = () => {
  const { withOptimisticUpdate } = useOptimisticUpdate()

  const executeQueued = useCallback(async <T>(
    operations: Array<{
      optimisticUpdate: () => void
      actualUpdate: () => Promise<T>
      rollback: () => void
      options?: OptimisticUpdateOptions
    }>
  ): Promise<OptimisticUpdateResult<T>[]> => {
    const results: OptimisticUpdateResult<T>[] = []

    // 順次実行
    for (const op of operations) {
      const result = await withOptimisticUpdate(
        op.optimisticUpdate,
        op.actualUpdate,
        op.rollback,
        op.options
      )
      results.push(result)

      // 一つでも失敗したら残りの操作は実行しない
      if (!result.success) {
        break
      }
    }

    return results
  }, [withOptimisticUpdate])

  return { executeQueued }
}