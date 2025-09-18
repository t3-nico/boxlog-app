import { useCallback, useEffect, useRef } from 'react'

import type { CalendarAction, CalendarToastOptions } from './types'

import { useCalendarToast } from './use-calendar-toast'

// デバウンス設定
export interface DebounceConfig {
  delay: number
  maxWait?: number // 最大待機時間（デバウンスが無限に続くのを防ぐ）
  leading?: boolean // 最初の呼び出しを即座に実行するか
  trailing?: boolean // 最後の呼び出しを実行するか（デフォルト: true）
}

// デバウンス状態
interface DebounceState {
  timeoutId?: NodeJS.Timeout
  lastCallTime?: number
  lastInvokeTime?: number
  result?: string
}

// グループ化設定
export interface ToastGroupConfig {
  key: string // グループ化のキー
  maxCount: number // 最大表示数
  collapseMessage: (count: number) => string // 省略時のメッセージ
}

// デバウンス付きToastフック
export const useDebouncedToast = () => {
  const toast = useCalendarToast()
  const debounceStates = useRef<Map<string, DebounceState>>(new Map())
  const groupedToasts = useRef<Map<string, { count: number; lastMessage: string; toastId?: string }>>(new Map())

  // クリーンアップ
  useEffect(() => {
    const currentDebounceStates = debounceStates.current
    const currentGroupedToasts = groupedToasts.current

    return () => {
      currentDebounceStates.forEach((state) => {
        if (state.timeoutId) {
          clearTimeout(state.timeoutId)
        }
      })
      currentDebounceStates.clear()
      currentGroupedToasts.clear()
    }
  }, [])

  // デバウンス実行関数
  const createDebouncedFunction = useCallback(
    <Args extends unknown[]>(fn: (...args: Args) => string, config: DebounceConfig, key: string = 'default') => {
      return (...args: Args): string | undefined => {
        const now = Date.now()
        const state = debounceStates.current.get(key) || {}

        const { delay, maxWait, leading = false, trailing = true } = config

        // 最初の呼び出しかつleadingが有効
        const isInvoking = !state.lastCallTime && leading

        // maxWait による強制実行判定
        const shouldInvokeByMaxWait = maxWait && state.lastInvokeTime && now - state.lastInvokeTime >= maxWait

        // 既存のタイマーをクリア
        if (state.timeoutId) {
          clearTimeout(state.timeoutId)
        }

        // 状態を更新
        state.lastCallTime = now

        if (isInvoking || shouldInvokeByMaxWait) {
          // 即座に実行
          state.lastInvokeTime = now
          state.result = fn(...args)
          debounceStates.current.set(key, state)
          return state.result
        }

        // デバウンス実行を設定
        if (trailing) {
          state.timeoutId = setTimeout(() => {
            state.lastInvokeTime = Date.now()
            state.result = fn(...args)
            state.timeoutId = undefined
          }, delay)
        }

        debounceStates.current.set(key, state)
        return state.result
      }
    },
    []
  )

  // デバウンス付きの基本Toast関数
  const debouncedSuccess = useCallback(
    (message: string, options?: CalendarToastOptions, config: DebounceConfig = { delay: 500 }) => {
      const key = `success-${message}`
      const debouncedFn = createDebouncedFunction(() => toast.success(message, options), config, key)
      return debouncedFn()
    },
    [createDebouncedFunction, toast]
  )

  const debouncedError = useCallback(
    (message: string, options?: CalendarToastOptions, config: DebounceConfig = { delay: 300 }) => {
      const key = `error-${message}`
      const debouncedFn = createDebouncedFunction(() => toast.error(message, options), config, key)
      return debouncedFn()
    },
    [createDebouncedFunction, toast]
  )

  const debouncedWarning = useCallback(
    (message: string, options?: CalendarToastOptions, config: DebounceConfig = { delay: 400 }) => {
      const key = `warning-${message}`
      const debouncedFn = createDebouncedFunction(() => toast.warning(message, options), config, key)
      return debouncedFn()
    },
    [createDebouncedFunction, toast]
  )

  // Calendar操作専用のデバウンス関数
  const debouncedCalendarAction = useCallback(
    (action: CalendarAction, options: CalendarToastOptions = {}, config: DebounceConfig = { delay: 300 }) => {
      const key = `calendar-${action}-${options.event?.id || 'unknown'}`
      const debouncedFn = createDebouncedFunction(() => toast.show(action, options), config, key)
      return debouncedFn()
    },
    [createDebouncedFunction, toast]
  )

  // グループ化Toast（同じ種類の操作をまとめる）
  const groupedToast = useCallback(
    (groupConfig: ToastGroupConfig, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
      const group = groupedToasts.current.get(groupConfig.key) || { count: 0, lastMessage: '' }

      group.count++
      group.lastMessage = message

      // 既存のToastを削除
      if (group.toastId) {
        toast.clear()
      }

      // 新しいToastを表示
      if (group.count <= groupConfig.maxCount) {
        // 個別メッセージを表示
        group.toastId = toast[type](message)
      } else {
        // 省略メッセージを表示
        group.toastId = toast[type](groupConfig.collapseMessage(group.count))
      }

      groupedToasts.current.set(groupConfig.key, group)

      // 一定時間後にカウントをリセット
      setTimeout(() => {
        const currentGroup = groupedToasts.current.get(groupConfig.key)
        if (currentGroup && currentGroup.count > 0) {
          currentGroup.count = Math.max(0, currentGroup.count - 1)
          if (currentGroup.count === 0) {
            groupedToasts.current.delete(groupConfig.key)
          }
        }
      }, 5000)

      return group.toastId
    },
    [toast]
  )

  // 連続するドラッグ操作用の特殊デバウンス
  const dragOperationToast = useCallback(
    (
      eventTitle: string,
      operationType: 'move' | 'resize' = 'move',
      config: DebounceConfig = { delay: 1000, maxWait: 3000 }
    ) => {
      const key = `drag-${operationType}-${eventTitle}`
      const debouncedFn = createDebouncedFunction(
        () => {
          const message = operationType === 'move' ? '予定を移動しました' : '予定をリサイズしました'
          return toast.success(message, {
            description: eventTitle,
          })
        },
        config,
        key
      )
      return debouncedFn()
    },
    [createDebouncedFunction, toast]
  )

  // 保存操作用の特殊デバウンス（連続保存を防ぐ）
  const saveOperationToast = useCallback(
    (message: string = '保存しました', config: DebounceConfig = { delay: 1000, leading: false, trailing: true }) => {
      const key = 'save-operation'
      const debouncedFn = createDebouncedFunction(() => toast.success(message), config, key)
      return debouncedFn()
    },
    [createDebouncedFunction, toast]
  )

  return {
    // 基本のデバウンス関数
    debouncedSuccess,
    debouncedError,
    debouncedWarning,

    // Calendar専用
    debouncedCalendarAction,

    // 特殊な用途向け
    groupedToast,
    dragOperationToast,
    saveOperationToast,

    // 通常のToast関数も提供
    ...toast,
  }
}

// 使用例のためのヘルパー関数
export const createToastGroupConfig = (
  key: string,
  maxCount: number,
  collapseMessage: (count: number) => string
): ToastGroupConfig => ({
  key,
  maxCount,
  collapseMessage,
})

// よく使われるグループ設定のプリセット
export const TOAST_GROUPS = {
  BULK_OPERATIONS: createToastGroupConfig('bulk-operations', 3, (count) => `${count}件の操作を実行しました`),

  SYNC_OPERATIONS: createToastGroupConfig('sync-operations', 2, (count) => `${count}件の同期操作を実行しました`),

  VALIDATION_ERRORS: createToastGroupConfig('validation-errors', 2, (count) => `${count}件の入力エラーがあります`),
}
