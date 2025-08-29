import { useCallback } from 'react'
import useCalendarToast from './index'

// ネットワークエラーの種類
export type NetworkErrorType = 'offline' | 'timeout' | 'server_error' | 'not_found' | 'unauthorized' | 'forbidden' | 'conflict' | 'unknown'

// ネットワークエラー情報
export interface NetworkErrorInfo {
  type: NetworkErrorType
  code?: string | number
  message?: string
  statusCode?: number
}

// エラー分類関数
export const classifyNetworkError = (error: any): NetworkErrorInfo => {
  // オフライン状態のチェック
  if (!navigator.onLine) {
    return { type: 'offline', message: 'インターネット接続がありません' }
  }

  // タイムアウトエラー
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return { type: 'timeout', message: 'リクエストがタイムアウトしました' }
  }

  // HTTPステータスコードによる分類
  if (error.response?.status || error.statusCode) {
    const status = error.response?.status || error.statusCode
    
    switch (status) {
      case 401:
        return { type: 'unauthorized', statusCode: status, message: '認証が必要です' }
      case 403:
        return { type: 'forbidden', statusCode: status, message: 'アクセスが拒否されました' }
      case 404:
        return { type: 'not_found', statusCode: status, message: 'リソースが見つかりません' }
      case 409:
        return { type: 'conflict', statusCode: status, message: 'データに競合が発生しました' }
      case 500:
      case 502:
      case 503:
      case 504:
        return { type: 'server_error', statusCode: status, message: 'サーバーエラーが発生しました' }
      default:
        return { type: 'unknown', statusCode: status, message: error.message || '予期しないエラーが発生しました' }
    }
  }

  // その他のエラー
  return { 
    type: 'unknown', 
    message: error.message || '予期しないエラーが発生しました',
    code: error.code 
  }
}

// ネットワークエラーハンドリング関数
export const handleNetworkError = (error: any, retryFn?: () => void | Promise<void>) => {
  const toast = useCalendarToast()
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
        description: 'ログインし直してください',
        duration: 8000,
        viewAction: () => {
          window.location.href = '/login'
        }
      })

    case 'forbidden':
      return toast.error('権限エラー', {
        description: 'この操作を実行する権限がありません',
        duration: 8000,
        viewAction: () => {
          window.location.href = '/settings/permissions'
        }
      })

    case 'not_found':
      return toast.error('データが見つかりません', {
        description: 'データが削除されているか、アクセス権限がありません',
        duration: 6000
      })

    case 'conflict':
      return toast.warning('データが競合しています', {
        description: '他のユーザーによって変更されています。画面を更新してください',
        duration: 8000,
        viewAction: () => {
          window.location.reload()
        }
      })

    case 'server_error':
      return toast.error('サーバーエラー', {
        description: 'しばらく待ってから再試行してください',
        duration: 8000,
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
}

// カスタムフック版
export const useNetworkErrorHandler = () => {
  const toast = useCalendarToast()

  const handleError = useCallback((error: any, retryFn?: () => void | Promise<void>) => {
    return handleNetworkError(error, retryFn)
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
    handleError,
    handlePermissionError,
    handleValidationError,
    classifyError: classifyNetworkError
  }
}