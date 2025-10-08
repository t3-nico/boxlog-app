// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
import { useCallback } from 'react'

import { getTranslation } from './get-translation'
import { CALENDAR_TOAST_KEYS } from './translation-keys'
import { useCalendarToast } from './use-calendar-toast'

// ネットワークエラーの種類
export type NetworkErrorType =
  | 'offline'
  | 'timeout'
  | 'server_error'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'unknown'

// ネットワークエラー情報
export interface NetworkErrorInfo {
  type: NetworkErrorType
  code?: string | number
  message?: string
  statusCode?: number
}

// HTTPステータスコードマッピング
const STATUS_CODE_MAPPING: Record<number, { type: NetworkErrorType; message: string }> = {
  401: { type: 'unauthorized', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_UNAUTHORIZED) },
  403: { type: 'forbidden', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_FORBIDDEN) },
  404: { type: 'not_found', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_NOT_FOUND) },
  409: { type: 'conflict', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_CONFLICT) },
  500: { type: 'server_error', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_SERVER_ERROR) },
  502: { type: 'server_error', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_SERVER_ERROR) },
  503: { type: 'server_error', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_SERVER_ERROR) },
  504: { type: 'server_error', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_SERVER_ERROR) },
}

// ヘルパー関数: オフライン状態チェック
const checkOfflineStatus = (): NetworkErrorInfo | null => {
  if (!navigator.onLine) {
    return { type: 'offline', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_OFFLINE) }
  }
  return null
}

// ヘルパー関数: タイムアウトエラーチェック
const checkTimeoutError = (error: Error & { code?: string; message?: string }): NetworkErrorInfo | null => {
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return { type: 'timeout', message: getTranslation(CALENDAR_TOAST_KEYS.ERROR_TIMEOUT) }
  }
  return null
}

// ヘルパー関数: HTTPステータスコード処理
const handleStatusCode = (status: number, errorMessage?: string): NetworkErrorInfo => {
  const statusMapping = STATUS_CODE_MAPPING[status]
  if (statusMapping) {
    return { type: statusMapping.type, statusCode: status, message: statusMapping.message }
  }
  return {
    type: 'unknown',
    statusCode: status,
    message: errorMessage || getTranslation(CALENDAR_TOAST_KEYS.ERROR_UNEXPECTED),
  }
}

// エラー分類関数（複雑度削減版）
export const classifyNetworkError = (
  error: Error & { code?: string; response?: { status: number }; statusCode?: number; message?: string }
): NetworkErrorInfo => {
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
    message: error.message || getTranslation(CALENDAR_TOAST_KEYS.ERROR_UNEXPECTED),
    code: error.code,
  }
}

// ネットワークエラーハンドリング用のカスタムフック
export const useNetworkErrorHandler = () => {
  const toast = useCalendarToast()

  const handleNetworkError = useCallback(
    (
      error: Error & { code?: string; response?: { status: number }; statusCode?: number },
      retryFn?: () => void | Promise<void>
    ) => {
      const errorInfo = classifyNetworkError(error)

      switch (errorInfo.type) {
        case 'offline':
          return toast.warning(getTranslation(CALENDAR_TOAST_KEYS.TOAST_OFFLINE), {
            description: getTranslation(CALENDAR_TOAST_KEYS.TOAST_OFFLINE_DESC),
            duration: 5000,
          })

        case 'timeout':
          return toast.error(getTranslation(CALENDAR_TOAST_KEYS.TOAST_TIMEOUT_TITLE), {
            description: getTranslation(CALENDAR_TOAST_KEYS.TOAST_TIMEOUT_DESC),
            duration: 8000,
            ...(retryFn && {
              retryAction: retryFn,
            }),
          })

        case 'unauthorized':
          return toast.error(getTranslation(CALENDAR_TOAST_KEYS.TOAST_AUTH_ERROR_TITLE), {
            description: getTranslation(CALENDAR_TOAST_KEYS.TOAST_AUTH_ERROR_DESC),
            duration: 10000,
            viewAction: () => {
              window.location.href = '/login'
            },
          })

        case 'forbidden':
          return toast.error(getTranslation(CALENDAR_TOAST_KEYS.TOAST_ACCESS_DENIED_TITLE), {
            description: getTranslation(CALENDAR_TOAST_KEYS.TOAST_ACCESS_DENIED_DESC),
            duration: 8000,
          })

        case 'not_found':
          return toast.warning(getTranslation(CALENDAR_TOAST_KEYS.TOAST_NOT_FOUND_TITLE), {
            description: getTranslation(CALENDAR_TOAST_KEYS.TOAST_NOT_FOUND_DESC),
            duration: 6000,
            ...(retryFn && {
              retryAction: retryFn,
            }),
          })

        case 'conflict':
          return toast.warning(getTranslation(CALENDAR_TOAST_KEYS.TOAST_CONFLICT_TITLE), {
            description: getTranslation(CALENDAR_TOAST_KEYS.TOAST_CONFLICT_DESC),
            duration: 8000,
            ...(retryFn && {
              retryAction: retryFn,
            }),
          })

        case 'server_error':
          return toast.error(getTranslation(CALENDAR_TOAST_KEYS.TOAST_SERVER_ERROR_TITLE), {
            description: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SERVER_ERROR_DESC),
            duration: 10000,
            ...(retryFn && {
              retryAction: retryFn,
            }),
          })

        default:
          return toast.error(getTranslation(CALENDAR_TOAST_KEYS.TOAST_UNKNOWN_ERROR_TITLE), {
            description: errorInfo.message || getTranslation(CALENDAR_TOAST_KEYS.TOAST_UNKNOWN_ERROR_DESC),
            duration: 6000,
            ...(retryFn && {
              retryAction: retryFn,
            }),
          })
      }
    },
    [toast]
  )

  const handlePermissionError = useCallback(
    (action: string) => {
      return toast.error(getTranslation(CALENDAR_TOAST_KEYS.TOAST_PERMISSION_ERROR_TITLE), {
        description: `${getTranslation(CALENDAR_TOAST_KEYS.TOAST_PERMISSION_ERROR_DESC)}（${action}）`,
        duration: 8000,
        viewAction: () => {
          window.location.href = '/settings/permissions'
        },
      })
    },
    [toast]
  )

  const handleValidationError = useCallback(
    (errors: string[] | string) => {
      const errorList = Array.isArray(errors) ? errors : [errors]
      return toast.error(getTranslation(CALENDAR_TOAST_KEYS.TOAST_VALIDATION_ERROR_TITLE), {
        description: errorList.join(', '),
        duration: 6000,
      })
    },
    [toast]
  )

  return {
    handleError: handleNetworkError,
    handlePermissionError,
    handleValidationError,
    classifyError: classifyNetworkError,
  }
}
