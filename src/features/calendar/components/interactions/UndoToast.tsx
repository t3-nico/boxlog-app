'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { X, Undo2, RotateCcw } from 'lucide-react'
import type { CalendarEvent } from '@/features/events'

interface UndoAction {
  id: string
  type: 'create' | 'delete' | 'edit' | 'move'
  description: string
  data: any
  timestamp: number
}

interface UndoToastProps {
  action: UndoAction | null
  onUndo: (action: UndoAction) => void
  onDismiss: () => void
  autoHideDelay?: number
}

export function UndoToast({ 
  action, 
  onUndo, 
  onDismiss, 
  autoHideDelay = 5000 
}: UndoToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

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
  }, [action, autoHideDelay])

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
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
        "transition-all duration-200 ease-out",
        isVisible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-2 opacity-0 scale-95"
      )}
    >
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 overflow-hidden min-w-[320px]">
        {/* プログレスバー */}
        <div 
          className="h-1 bg-primary transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
        
        <div className="p-4 flex items-center gap-3">
          {/* アイコン */}
          <div className="flex-shrink-0">
            {action.type === 'create' && (
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-sm">+</span>
              </div>
            )}
            {action.type === 'delete' && (
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-red-400" />
              </div>
            )}
            {action.type === 'edit' && (
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-sm">✏️</span>
              </div>
            )}
            {action.type === 'move' && (
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-purple-400" />
              </div>
            )}
          </div>
          
          {/* メッセージ */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              {action.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Press Ctrl+Z to undo
            </p>
          </div>
          
          {/* アクション */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium",
                "bg-primary text-primary-foreground rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50",
                "transition-colors duration-150"
              )}
            >
              <Undo2 className="w-3 h-3" />
              Undo
            </button>
            
            <button
              onClick={handleDismiss}
              className={cn(
                "p-1.5 text-gray-400 hover:text-white rounded-md",
                "hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500",
                "transition-colors duration-150"
              )}
            >
              <X className="w-4 h-4" />
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
      timestamp: Date.now()
    }
    
    setUndoStack(prev => {
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
    undoStack
  }
}

// 具体的なアクション生成ヘルパー
export const createUndoActions = {
  eventCreated: (event: CalendarEvent): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'create',
    description: `Created "${event.title}"`,
    data: { event }
  }),
  
  eventDeleted: (event: CalendarEvent): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'delete',
    description: `Deleted "${event.title}"`,
    data: { event }
  }),
  
  eventMoved: (event: CalendarEvent, oldData: { startDate: Date, endDate?: Date }): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'move',
    description: `Moved "${event.title}"`,
    data: { event, oldData }
  }),
  
  eventEdited: (event: CalendarEvent, oldData: Partial<CalendarEvent>): Omit<UndoAction, 'id' | 'timestamp'> => ({
    type: 'edit',
    description: `Edited "${event.title}"`,
    data: { event, oldData }
  })
}