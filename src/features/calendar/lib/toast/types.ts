import type { ExternalToast } from 'sonner'

import type { CalendarPlan } from '@/features/calendar/types'

// Calendar操作の種類
export type CalendarAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'duplicated'
  | 'bulk-deleted'
  | 'sync-started'
  | 'sync-completed'
  | 'sync-failed'

// Calendar Toast用の拡張型
export interface CalendarToastOptions {
  event?: CalendarPlan
  events?: CalendarPlan[]
  count?: number
  undoAction?: () => void | Promise<void>
  viewAction?: () => void
  retryAction?: () => void | Promise<void>
  fromDate?: Date
  toDate?: Date
  description?: string
  duration?: number
}

// メッセージテンプレート型
export interface ToastTemplate {
  title: string
  description?: (options: CalendarToastOptions) => string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
}

export type ToastTemplates = Record<CalendarAction, ToastTemplate>

// CalendarToastOptionsをsonnerのExternalToastに変換するヘルパー関数
export function toExternalToast(options?: CalendarToastOptions): ExternalToast | undefined {
  if (!options) return undefined

  const externalToast: ExternalToast = {}

  // descriptionとdurationを直接マッピング
  if (options.description) {
    externalToast.description = options.description
  }
  if (options.duration !== undefined) {
    externalToast.duration = options.duration
  }

  // actionボタンの処理（優先順位: undo > view > retry）
  if (options.undoAction) {
    externalToast.action = {
      label: '元に戻す',
      onClick: () => {
        void options.undoAction?.()
      },
    }
  } else if (options.viewAction) {
    externalToast.action = {
      label: '表示',
      onClick: () => {
        options.viewAction?.()
      },
    }
  } else if (options.retryAction) {
    externalToast.action = {
      label: '再試行',
      onClick: () => {
        void options.retryAction?.()
      },
    }
  }

  return externalToast
}
