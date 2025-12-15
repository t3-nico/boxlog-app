import { useEffect, useState } from 'react'

/**
 * ローディングタイムアウトを検出するhook
 *
 * 指定時間以上ローディングが続いた場合にタイムアウトを通知。
 * ユーザーにリトライを促すUIを表示するために使用。
 *
 * @example
 * ```tsx
 * const { data, isLoading } = api.plans.list.useQuery()
 * const hasTimedOut = useLoadingTimeout(isLoading, 10000) // 10秒
 *
 * if (hasTimedOut) {
 *   return <TimeoutFallback onRetry={refetch} />
 * }
 *
 * if (isLoading) {
 *   return <Skeleton />
 * }
 * ```
 *
 * @param isLoading - ローディング状態
 * @param timeout - タイムアウト時間（ミリ秒、デフォルト: 10000ms = 10秒）
 * @returns タイムアウトしたかどうか
 */
export function useLoadingTimeout(isLoading: boolean, timeout = 10000): boolean {
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // ローディング終了時はタイムアウト状態をリセット
      setHasTimedOut(false)
      return
    }

    // タイムアウトタイマーを設定
    const timer = setTimeout(() => {
      setHasTimedOut(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [isLoading, timeout])

  return hasTimedOut
}

/**
 * ローディング状態の詳細情報を提供するhook
 *
 * タイムアウト、経過時間、段階的なメッセージ表示に対応
 *
 * @example
 * ```tsx
 * const { data, isLoading } = api.plans.list.useQuery()
 * const loadingState = useLoadingState(isLoading, {
 *   timeout: 10000,
 *   warningThreshold: 5000
 * })
 *
 * if (loadingState.hasTimedOut) {
 *   return <TimeoutError />
 * }
 *
 * if (loadingState.isWarning) {
 *   return <Skeleton message="読み込みに時間がかかっています..." />
 * }
 * ```
 */
export interface LoadingStateOptions {
  /** タイムアウト時間（ミリ秒） */
  timeout?: number
  /** 警告表示までの時間（ミリ秒） */
  warningThreshold?: number
}

export interface LoadingStateResult {
  /** タイムアウトしたか */
  hasTimedOut: boolean
  /** 警告状態か（warningThreshold超過） */
  isWarning: boolean
  /** 経過時間（ミリ秒） */
  elapsedTime: number
}

export function useLoadingState(isLoading: boolean, options: LoadingStateOptions = {}): LoadingStateResult {
  const { timeout = 10000, warningThreshold = 5000 } = options

  const [state, setState] = useState<LoadingStateResult>({
    hasTimedOut: false,
    isWarning: false,
    elapsedTime: 0,
  })

  useEffect(() => {
    if (!isLoading) {
      setState({ hasTimedOut: false, isWarning: false, elapsedTime: 0 })
      return
    }

    const startTime = Date.now()

    // 経過時間の更新（1秒ごと）
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime
      setState({
        hasTimedOut: elapsed >= timeout,
        isWarning: elapsed >= warningThreshold && elapsed < timeout,
        elapsedTime: elapsed,
      })
    }, 1000)

    // 警告タイマー
    const warningTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, isWarning: true }))
    }, warningThreshold)

    // タイムアウトタイマー
    const timeoutTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, hasTimedOut: true, isWarning: false }))
    }, timeout)

    return () => {
      clearInterval(intervalId)
      clearTimeout(warningTimer)
      clearTimeout(timeoutTimer)
    }
  }, [isLoading, timeout, warningThreshold])

  return state
}
