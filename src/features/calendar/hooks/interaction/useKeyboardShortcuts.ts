/**
 * キーボードショートカット機能のカスタムフック
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'

import type { CalendarEvent } from '@/features/events'

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
    
    // 基本的なナビゲーション
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
          const now = new Date()
          const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          debounceAction(() => onPaste?.(now, timeString))
          return
          
        case 'n':
          e.preventDefault()
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
          const today = new Date()
          debounceAction(() => onCreateEvent?.(today, '09:00'))
          return
        }
        break
        
      case 'h':
      case '?':
        if (!isModKey) {
          e.preventDefault()
          onShowHelp?.()
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