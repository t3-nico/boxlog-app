/**
 * キーボードショートカット機能を管理するフック
 */

'use client'

import { useCallback, useEffect } from 'react'

export interface KeyboardShortcutActions {
  onEscape?: () => void
  onEnter?: () => void
  onSpace?: () => void
  onDelete?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
}

export interface UseKeyboardShortcutsOptions {
  isActive?: boolean
  actions: KeyboardShortcutActions
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const { isActive = true, actions } = options

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return

      // デフォルト動作を防ぐキー
      const preventDefaultKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']
      if (preventDefaultKeys.includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case 'Escape':
          actions.onEscape?.()
          break
        case 'Enter':
          actions.onEnter?.()
          break
        case ' ':
        case 'Space':
          actions.onSpace?.()
          break
        case 'Delete':
        case 'Backspace':
          actions.onDelete?.()
          break
        case 'ArrowUp':
          actions.onArrowUp?.()
          break
        case 'ArrowDown':
          actions.onArrowDown?.()
          break
        case 'ArrowLeft':
          actions.onArrowLeft?.()
          break
        case 'ArrowRight':
          actions.onArrowRight?.()
          break
      }
    },
    [isActive, actions]
  )

  useEffect(() => {
    if (!isActive) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, handleKeyDown])

  return {
    // 現在アクティブかどうかの状態を返す
    isActive,
  }
}
