'use client'

import { useEffect, useCallback, useRef } from 'react'
import type { CalendarEvent } from '@/features/events'

interface KeyboardShortcutsProps {
  selectedEvent?: CalendarEvent | null
  onCreateEvent?: (date: Date, time: string) => void
  onDeleteEvent?: (event: CalendarEvent) => void
  onEditEvent?: (event: CalendarEvent) => void
  onDuplicateEvent?: (event: CalendarEvent) => void
  onUndo?: () => void
  onRedo?: () => void
  onCopy?: (event: CalendarEvent) => void
  onPaste?: (date: Date, time: string) => void
  onSelectNext?: () => void
  onSelectPrevious?: () => void
  onEscape?: () => void
  isEnabled?: boolean
}

export function KeyboardShortcuts({
  selectedEvent,
  onCreateEvent,
  onDeleteEvent,
  onEditEvent,
  onDuplicateEvent,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onSelectNext,
  onSelectPrevious,
  onEscape,
  isEnabled = true
}: KeyboardShortcutsProps) {
  const lastActionTimeRef = useRef(0)
  const actionDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // パフォーマンス最適化: デバウンス処理
  const debounceAction = useCallback((action: () => void, delay = 50) => {
    if (actionDebounceRef.current) {
      clearTimeout(actionDebounceRef.current)
    }
    
    actionDebounceRef.current = setTimeout(() => {
      const now = Date.now()
      if (now - lastActionTimeRef.current > delay) {
        action()
        lastActionTimeRef.current = now
      }
    }, delay)
  }, [])

  // 高速なキーボード処理（100ms以下の反応速度）
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return

    // モーダルやインプットがアクティブな場合は無視
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    const { key, ctrlKey, metaKey, shiftKey, altKey } = e
    const isModKey = ctrlKey || metaKey
    const currentTime = Date.now()

    // 基本的なナビゲーション（即座に実行）
    switch (key) {
      case 'Escape':
        e.preventDefault()
        onEscape?.()
        return

      case 'ArrowUp':
        if (!isModKey) {
          e.preventDefault()
          onSelectPrevious?.()
          return
        }
        break

      case 'ArrowDown':
        if (!isModKey) {
          e.preventDefault()
          onSelectNext?.()
          return
        }
        break
    }

    // 選択されたイベントに対する操作
    if (selectedEvent) {
      switch (key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          debounceAction(() => onDeleteEvent?.(selectedEvent), 0)
          return

        case 'Enter':
          e.preventDefault()
          debounceAction(() => onEditEvent?.(selectedEvent), 0)
          return

        case 'd':
          if (isModKey) {
            e.preventDefault()
            debounceAction(() => onDuplicateEvent?.(selectedEvent))
            return
          }
          break

        case 'c':
          if (isModKey) {
            e.preventDefault()
            debounceAction(() => onCopy?.(selectedEvent))
            return
          }
          break
      }
    }

    // グローバルショートカット
    if (isModKey) {
      switch (key) {
        case 'z':
          e.preventDefault()
          if (shiftKey) {
            debounceAction(() => onRedo?.())
          } else {
            debounceAction(() => onUndo?.())
          }
          return

        case 'v':
          e.preventDefault()
          // ペースト処理（現在時刻に）
          const now = new Date()
          const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          debounceAction(() => onPaste?.(now, timeString))
          return

        case 'n':
          e.preventDefault()
          // 新規イベント作成（現在時刻に）
          const createNow = new Date()
          const createTimeString = `${String(createNow.getHours()).padStart(2, '0')}:${String(createNow.getMinutes()).padStart(2, '0')}`
          debounceAction(() => onCreateEvent?.(createNow, createTimeString))
          return
      }
    }

    // 単一キーショートカット
    switch (key) {
      case 'a':
        if (!isModKey) {
          e.preventDefault()
          // 今日の9:00に新規イベント作成
          const today = new Date()
          debounceAction(() => onCreateEvent?.(today, '09:00'))
          return
        }
        break

      case 'h':
        if (!isModKey) {
          // ヘルプ表示
          e.preventDefault()
          showKeyboardHelp()
          return
        }
        break
    }
  }, [
    isEnabled,
    selectedEvent,
    onCreateEvent,
    onDeleteEvent,
    onEditEvent,
    onDuplicateEvent,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onSelectNext,
    onSelectPrevious,
    onEscape,
    debounceAction
  ])

  // ヘルプモーダル表示
  const showKeyboardHelp = useCallback(() => {
    const helpContent = `
カレンダーのキーボードショートカット:

基本操作:
• ↑/↓ - イベント選択
• Enter - 選択したイベントを編集
• Delete/Backspace - 選択したイベントを削除
• Escape - 選択解除/モーダルを閉じる

イベント操作:
• Ctrl+N - 新規イベント作成
• Ctrl+D - 選択したイベントを複製
• Ctrl+C - 選択したイベントをコピー
• Ctrl+V - ペースト
• A - 今日の9:00に新規イベント作成

編集操作:
• Ctrl+Z - 元に戻す
• Ctrl+Shift+Z - やり直し

その他:
• H - このヘルプを表示
    `
    
    // シンプルなアラート（実際はカスタムモーダルを使用推奨）
    alert(helpContent)
  }, [])

  // イベントリスナーの登録
  useEffect(() => {
    if (!isEnabled) return

    // パッシブリスナーを使用してパフォーマンスを向上
    document.addEventListener('keydown', handleKeyDown, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (actionDebounceRef.current) {
        clearTimeout(actionDebounceRef.current)
      }
    }
  }, [handleKeyDown, isEnabled])

  // このコンポーネントは何もレンダリングしない
  return null
}

// キーボードショートカットのヘルプコンポーネント
export function KeyboardShortcutsHelp({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean
  onClose: () => void 
}) {
  useEffect(() => {
    if (isVisible) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Navigation</h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>↑/↓</span>
                <span>Select event</span>
              </div>
              <div className="flex justify-between">
                <span>Escape</span>
                <span>Clear selection</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Event Actions</h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Enter</span>
                <span>Edit event</span>
              </div>
              <div className="flex justify-between">
                <span>Delete</span>
                <span>Delete event</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+D</span>
                <span>Duplicate event</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Creation</h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Ctrl+N</span>
                <span>New event</span>
              </div>
              <div className="flex justify-between">
                <span>A</span>
                <span>Quick event at 9AM</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Edit</h3>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Ctrl+Z</span>
                <span>Undo</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+Shift+Z</span>
                <span>Redo</span>
              </div>
              <div className="flex justify-between">
                <span>Ctrl+C/V</span>
                <span>Copy/Paste</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

// パフォーマンス監視用のhook
export function usePerformanceMonitor() {
  const performanceRef = useRef({
    keydownCount: 0,
    averageResponseTime: 0,
    lastMeasurements: [] as number[]
  })

  const measureAction = useCallback((action: () => void) => {
    const startTime = performance.now()
    
    action()
    
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    // 平均応答時間を計算
    const measurements = performanceRef.current.lastMeasurements
    measurements.push(responseTime)
    
    if (measurements.length > 10) {
      measurements.shift()
    }
    
    const average = measurements.reduce((a, b) => a + b, 0) / measurements.length
    performanceRef.current.averageResponseTime = average
    performanceRef.current.keydownCount++
    
    // 100ms以上の場合は警告
    if (responseTime > 100) {
      console.warn(`Slow keyboard response: ${responseTime.toFixed(2)}ms`)
    }
    
    return responseTime
  }, [])

  const getPerformanceStats = useCallback(() => {
    return {
      ...performanceRef.current,
      isOptimal: performanceRef.current.averageResponseTime < 100
    }
  }, [])

  return { measureAction, getPerformanceStats }
}