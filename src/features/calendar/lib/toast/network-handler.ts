// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
import { useCallback } from 'react'

import { useCalendarToast } from './use-calendar-toast'

// ネットワークエラーの種類
export type NetworkErrorType = 'offline' | 'timeout' | 'server_error' | 'not_found' | 'unauthorized' | 'forbidden' | 'conflict' | 'unknown'

// ネットワークエラー情報
export interface NetworkErrorInfo {
  type: NetworkErrorType
  code?: string | number
  message?: string
  statusCode?: number
}

// HTTPステータスコードマッピング
const STATUS_CODE_MAPPING: Record<number, { type: NetworkErrorType; message: string }> = {
  401: { type: 'unauthorized', message: '認証が必要です' },
  403: { type: 'forbidden', message: 'アクセスが拒否されました' },
  404: { type: 'not_found', message: 'リソースが見つかりません' },
  409: { type: 'conflict', message: 'データに競合が発生しました' },
  500: { type: 'server_error', message: 'サーバーエラーが発生しました' },
  502: { type: 'server_error', message: 'サーバーエラーが発生しました' },
  503: { type: 'server_error', message: 'サーバーエラーが発生しました' },
  504: { type: 'server_error', message: 'サーバーエラーが発生しました' }
}

// ヘルパー関数: オフライン状態チェック
const checkOfflineStatus = (): NetworkErrorInfo | null => {
  if (!navigator.onLine) {
    return { type: 'offline', message: 'インターネット接続がありません' }
  }
  return null
}

// ヘルパー関数: タイムアウトエラーチェック
const checkTimeoutError = (error: Error & { code?: string; message?: string }): NetworkErrorInfo | null => {
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return { type: 'timeout', message: 'リクエストがタイムアウトしました' }
  }
  return null
}

// ヘルパー関数: HTTPステータスコード処理
const handleStatusCode = (status: number, errorMessage?: string): NetworkErrorInfo => {
  const statusMapping = STATUS_CODE_MAPPING[status]
  if (statusMapping) {
    return { type: statusMapping.type, statusCode: status, message: statusMapping.message }
  }
  return { type: 'unknown', statusCode: status, message: errorMessage || '予期しないエラーが発生しました' }
}

// エラー分類関数（複雑度削減版）
export const classifyNetworkError = (error: Error & { code?: string; response?: { status: number }; statusCode?: number; message?: string }): NetworkErrorInfo => {
  // オフライン状態のチェック
  const offlineResult = checkOfflineStatus()
  if (offlineResult) return offlineResult

  // タイムアウトエラーチェック
  const timeoutResult = checkTimeoutError(error)
  if (timeoutResult) return timeoutResult

  // HTTPステータスコードによる分類
  const status = error.response?.status || error.statusCode
  if (status) {
    return handleStatusCode(status, error.message)
  }

  // その他のエラー
  return { 
    type: 'unknown', 
    message: error.message || '予期しないエラーが発生しました',
    code: error.code 
  }
}

// ネットワークエラーハンドリング用のカスタムフック
export const useNetworkErrorHandler = () => {
  const toast = useCalendarToast()
  
  const handleNetworkError = useCallback((error: Error & { code?: string; response?: { status: number }; statusCode?: number }, retryFn?: () => void | Promise<void>) => {
    const errorInfo = classifyNetworkError(error)

    switch (errorInfo.type) {
      case 'offline':
        return toast.warning('オフラインです', {
          description: 'インターネット接続を確認してください',
          duration: 5000
        })

      case 'timeout':
        return toast.error('タイムアウトしました', {
          description: 'しばらく待ってから再試行してください',
          duration: 8000,
          ...(retryFn && {
            retryAction: retryFn
          })
        })

      case 'unauthorized':
        return toast.error('認証エラー', {
          description: '再度ログインしてください',
          duration: 10000,
          viewAction: () => {
            window.location.href = '/login'
          }
        })

      case 'forbidden':
        return toast.error('アクセス拒否', {
          description: 'この操作を実行する権限がありません',
          duration: 8000
        })

      case 'not_found':
        return toast.warning('データが見つかりません', {
          description: 'データが削除されているか移動されています',
          duration: 6000,
          ...(retryFn && {
            retryAction: retryFn
          })
        })

      case 'conflict':
        return toast.warning('データが更新されています', {
          description: '他のユーザーがデータを変更しました。最新のデータを確認してください',
          duration: 8000,
          ...(retryFn && {
            retryAction: retryFn
          })
        })

      case 'server_error':
        return toast.error('サーバーエラー', {
          description: 'サーバーで問題が発生しています。しばらく待ってから再試行してください',
          duration: 10000,
          ...(retryFn && {
            retryAction: retryFn
          })
        })

      default:
        return toast.error('エラーが発生しました', {
          description: errorInfo.message || '予期しないエラーです',
          duration: 6000,
          ...(retryFn && {
            retryAction: retryFn
          })
        })
    }
  }, [toast])

  const handlePermissionError = useCallback((action: string) => {
    return toast.error('権限がありません', {
      description: `この操作（${action}）を実行する権限がありません`,
      duration: 8000,
      viewAction: () => {
        window.location.href = '/settings/permissions'
      }
    })
  }, [toast])

  const handleValidationError = useCallback((errors: string[] | string) => {
    const errorList = Array.isArray(errors) ? errors : [errors]
    return toast.error('入力エラー', {
      description: errorList.join(', '),
      duration: 6000
    })
  }, [toast])

  return {
    handleError: handleNetworkError,
    handlePermissionError,
    handleValidationError,
    classifyError: classifyNetworkError
  }
}