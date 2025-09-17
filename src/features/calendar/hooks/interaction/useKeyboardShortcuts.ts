/**
 * キーボードショートカット機能のカスタムフック
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'

import type { CalendarEvent } from '@/features/events'

import {
  handleBasicNavigation,
  handleSelectedEventActions,
  handleGlobalShortcuts,
  handleSingleKeyShortcuts,
  type KeyboardShortcutCallbacks
} from './keyboardShortcutHandlers'

export interface KeyboardShortcutHandlers {
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
  onShowHelp?: () => void
}

export interface UseKeyboardShortcutsOptions extends KeyboardShortcutHandlers {
  isEnabled?: boolean
  debounceDelay?: number
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const {
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
    onShowHelp,
    isEnabled = true,
    debounceDelay = 50
  } = options
  
  const lastActionTimeRef = useRef(0)
  const actionDebounceRef = useRef<NodeJS.Timeout | null>(null)
  
  // デバウンス処理
  const debounceAction = useCallback((action: () => void, delay = debounceDelay) => {
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
  }, [debounceDelay])
  
  // キーボードイベントハンドラー
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return
    
    // モーダルやインプットがアクティブな場合は無視
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }
    
    const { key, ctrlKey, metaKey, shiftKey } = e
    const isModKey = ctrlKey || metaKey
    
    // コールバック集約
    const callbacks: KeyboardShortcutCallbacks = {
      onEscape,
      onSelectPrevious,
      onSelectNext,
      onDeleteEvent,
      onEditEvent,
      onDuplicateEvent,
      onCopy,
      onUndo,
      onRedo,
      onPaste,
      onCreateEvent,
      onToggleHelp: onShowHelp
    }

    // コンテキスト作成
    const context = {
      event: e,
      selectedEvent,
      debounceAction,
      callbacks
    }

    // 分離されたハンドラーで処理
    if (handleBasicNavigation(context)) return
    if (handleSelectedEventActions(context)) return
    if (handleGlobalShortcuts(context)) return
    if (handleSingleKeyShortcuts(context)) return
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
    onShowHelp,
    debounceAction
  ])
  
  // イベントリスナーの登録
  useEffect(() => {
    if (!isEnabled) return
    
    document.addEventListener('keydown', handleKeyDown, { passive: false })
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (actionDebounceRef.current) {
        clearTimeout(actionDebounceRef.current)
      }
    }
  }, [handleKeyDown, isEnabled])
  
  return {
    isEnabled
  }
}

// キーボードショートカット一覧
export const KEYBOARD_SHORTCUTS = {
  navigation: {
    'ArrowUp/ArrowDown': 'Select event',
    'Escape': 'Clear selection'
  },
  eventActions: {
    'Enter': 'Edit event',
    'Delete/Backspace': 'Delete event',
    'Ctrl+D': 'Duplicate event',
    'Ctrl+C': 'Copy event'
  },
  creation: {
    'Ctrl+N': 'New event',
    'A': 'Quick event at 9AM',
    'Ctrl+V': 'Paste event'
  },
  editing: {
    'Ctrl+Z': 'Undo',
    'Ctrl+Shift+Z': 'Redo'
  },
  help: {
    'H or ?': 'Show help'
  }
} as const