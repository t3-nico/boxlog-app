// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
import { useCallback } from 'react'

import { toast } from 'sonner'

import { getTranslation } from './get-translation'
import { toastTemplates } from './templates'
import { CALENDAR_TOAST_KEYS } from './translation-keys'
import type { CalendarAction, CalendarEvent, CalendarToastOptions } from './types'

export const useCalendarToast = () => {
  // 汎用的なtoast表示関数
  const showCalendarToast = useCallback((action: CalendarAction, options: CalendarToastOptions = {}) => {
    const template = toastTemplates[action]
    const description = template.description?.(options)

    // duration を動的に計算
    const duration = typeof template.duration === 'function' ? template.duration(options) : template.duration

    // アクションボタンの構築
    const actions: Array<{ label: string; onClick: () => void }> = []

    if (options.undoAction) {
      actions.push({
        label: getTranslation(CALENDAR_TOAST_KEYS.TOAST_UNDO),
        onClick: () => {
          options.undoAction!()
          toast.success(getTranslation(CALENDAR_TOAST_KEYS.TOAST_UNDO_COMPLETED))
        },
      })
    }

    if (options.viewAction) {
      actions.push({
        label: getTranslation(CALENDAR_TOAST_KEYS.TOAST_VIEW),
        onClick: options.viewAction,
      })
    }

    if (options.retryAction) {
      actions.push({
        label: getTranslation(CALENDAR_TOAST_KEYS.TOAST_RETRY),
        onClick: options.retryAction,
      })
    }

    // 既存のtoastシステムを使用
    const toastOptions = {
      description,
      duration,
      ...(actions.length > 0 && {
        action: {
          label: actions[0].label,
          onClick: actions[0].onClick,
        },
      }),
    }

    const toastId = toast[template.type](template.title, toastOptions)

    return toastId
  }, [])

  // 便利なショートカット関数
  const eventCreated = useCallback(
    (event: CalendarEvent, options?: CalendarToastOptions) => {
      return showCalendarToast('created', { event, ...options })
    },
    [showCalendarToast]
  )

  const eventUpdated = useCallback(
    (event: CalendarEvent, options?: CalendarToastOptions) => {
      return showCalendarToast('updated', { event, ...options })
    },
    [showCalendarToast]
  )

  const eventDeleted = useCallback(
    (event: CalendarEvent, undoAction?: () => void) => {
      return showCalendarToast('deleted', { event, undoAction })
    },
    [showCalendarToast]
  )

  const eventMoved = useCallback(
    (event: CalendarEvent, toDate: Date, options?: CalendarToastOptions) => {
      return showCalendarToast('moved', { event, toDate, ...options })
    },
    [showCalendarToast]
  )

  const bulkDeleted = useCallback(
    (count: number, undoAction?: () => void) => {
      return showCalendarToast('bulk-deleted', { count, undoAction })
    },
    [showCalendarToast]
  )

  // 同期関連
  const syncStart = useCallback(() => {
    return showCalendarToast('sync-started')
  }, [showCalendarToast])

  const syncComplete = useCallback(() => {
    return showCalendarToast('sync-completed')
  }, [showCalendarToast])

  const syncFailed = useCallback(
    (retryAction?: () => void) => {
      return showCalendarToast('sync-failed', { retryAction })
    },
    [showCalendarToast]
  )

  // Promise対応（既存のuseToastから）
  const promise = useCallback(
    async <T>(
      promise: Promise<T>,
      messages: {
        loading?: string
        success?: string | ((data: T) => string)
        error?: string | ((error: Error) => string)
      }
    ) => {
      const id = toast.loading(messages.loading || getTranslation(CALENDAR_TOAST_KEYS.TOAST_PROCESSING))

      try {
        const result = await promise
        toast.dismiss(id)
        toast.success(
          typeof messages.success === 'function'
            ? messages.success(result)
            : messages.success || getTranslation(CALENDAR_TOAST_KEYS.TOAST_SUCCESS)
        )
        return result
      } catch (error) {
        toast.dismiss(id)
        toast.error(
          typeof messages.error === 'function'
            ? messages.error(error)
            : messages.error || getTranslation(CALENDAR_TOAST_KEYS.TOAST_ERROR_OCCURRED)
        )
        throw error
      }
    },
    []
  )

  return {
    // 汎用関数
    show: showCalendarToast,
    promise,

    // Calendar特化関数
    eventCreated,
    eventUpdated,
    eventDeleted,
    eventMoved,
    bulkDeleted,
    syncStart,
    syncComplete,
    syncFailed,

    // 既存のtoast関数も露出
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    loading: toast.loading,
    clear: toast.clear,
  }
}
