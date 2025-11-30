'use client'

import { useCallback, useEffect, useState } from 'react'

import { RotateCcw, Undo2, X } from 'lucide-react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

interface UndoAction {
  id: string
  type: 'create' | 'delete' | 'edit' | 'move'
  description: string
  data:
    | CalendarPlan
    | {
        eventId: string
        oldPosition?: { startTime: Date; endTime: Date }
        newPosition?: { startTime: Date; endTime: Date }
      }
  timestamp: number
}

interface UndoToastProps {
  action: UndoAction | null
  onUndo: (action: UndoAction) => void
  onDismiss: () => void
  autoHideDelay?: number
}

export const UndoToast = ({ action, onUndo, onDismiss, autoHideDelay = 5000 }: UndoToastProps) => {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const handleUndo = useCallback(() => {
    if (action) {
      onUndo(action)
      setIsVisible(false)
    }
  }, [action, onUndo])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss()
    }, 200) // アニメーション完了を待つ
  }, [onDismiss])

  useEffect(() => {
    if (action) {
      setIsVisible(true)

      setProgress(100)

      // プログレスバーのアニメーション
      const startTime = Date.now()
      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, autoHideDelay - elapsed)
        const newProgress = (remaining / autoHideDelay) * 100

        setProgress(newProgress)

        if (remaining > 0) {
          requestAnimationFrame(updateProgress)
        } else {
          handleDismiss()
        }
      }

      requestAnimationFrame(updateProgress)
    } else {
      setIsVisible(false)
    }
  }, [action, autoHideDelay, handleDismiss])

  // キーボードショートカット
  useEffect(() => {
    if (!action) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [action, handleUndo, handleDismiss])

  if (!action) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform',
        'transition-all duration-200 ease-out',
        isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
      )}
    >
      <div className="border-border bg-popover text-popover-foreground min-w-[320px] overflow-hidden rounded-lg border shadow-2xl">
        {/* プログレスバー */}
        <div className="bg-primary h-1 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />

        <div className="flex items-center gap-3 p-4">
          {/* アイコン */}
          <div className="flex-shrink-0">
            {action.type === 'create' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                <span className="text-sm text-green-400">+</span>
              </div>
            )}
            {action.type === 'delete' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                <X className="h-4 w-4 text-red-400" />
              </div>
            )}
            {action.type === 'edit' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-sm text-blue-400">✏️</span>
              </div>
            )}
            {action.type === 'move' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                <RotateCcw className="h-4 w-4 text-purple-400" />
              </div>
            )}
          </div>

          {/* メッセージ */}
          <div className="min-w-0 flex-1">
            <p className="text-foreground text-sm font-medium">{action.description}</p>
            <p className="text-muted-foreground mt-1 text-xs">{t('calendar.undoToast.undoShortcut')}</p>
          </div>

          {/* アクション */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium',
                'bg-primary text-primary-foreground rounded-md',
                'hover:bg-primary/92 focus:ring-primary/50 focus:ring-2 focus:outline-none',
                'transition-colors duration-150'
              )}
            >
              <Undo2 className="h-3 w-3" />
              {t('calendar.undoToast.undoButton')}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                'text-muted-foreground hover:text-foreground rounded-md p-2',
                'hover:bg-foreground/8 focus:ring-ring focus:ring-2 focus:outline-none',
                'transition-colors duration-150'
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Undoアクション管理用のhook
export function useUndoManager() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([])
  const [currentAction, setCurrentAction] = useState<UndoAction | null>(null)

  const addAction = useCallback((action: Omit<UndoAction, 'id' | 'timestamp'>) => {
    const newAction: UndoAction = {
      ...action,
      id: `undo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    setUndoStack((prev) => {
      // 最大10個のアクションを保持
      const newStack = [newAction, ...prev].slice(0, 10)
      return newStack
    })

    setCurrentAction(newAction)
  }, [])

  const performUndo = useCallback((action: UndoAction) => {
    setCurrentAction(null)
    return action
  }, [])

  const dismissCurrent = useCallback(() => {
    setCurrentAction(null)
  }, [])

  const canUndo = undoStack.length > 0

  return {
    currentAction,
    canUndo,
    addAction,
    performUndo,
    dismissCurrent,
    undoStack,
  }
}

// 具体的なアクション生成ヘルパー
export const createUndoActions = {
  eventCreated: (plan: CalendarPlan): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'create',
    description: `Created "${plan.title}"`,
    data: plan,
  }),

  eventDeleted: (plan: CalendarPlan): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'delete',
    description: `Deleted "${plan.title}"`,
    data: plan,
  }),

  eventMoved: (
    plan: CalendarPlan,
    oldData: { startDate: Date; endDate?: Date }
  ): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'move',
    description: `Moved "${plan.title}"`,
    data: plan,
  }),

  eventEdited: (plan: CalendarPlan, oldData: Partial<CalendarPlan>): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'edit',
    description: `Edited "${plan.title}"`,
    data: plan,
  }),
}
