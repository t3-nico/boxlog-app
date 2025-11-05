import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import { useEffect, useRef } from 'react'
import { useInboxFocusStore } from '../stores/useInboxFocusStore'
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore'

interface UseInboxKeyboardShortcutsOptions {
  /** 表示中のアイテムIDリスト */
  itemIds: string[]
  /** 検索フィールドのref */
  searchInputRef?: React.RefObject<HTMLInputElement>
  /** ショートカットを有効にするか */
  enabled?: boolean
}

/**
 * Inboxテーブル用キーボードショートカット
 *
 * 以下のショートカットを提供：
 * - j: 次の行にフォーカス移動
 * - k: 前の行にフォーカス移動
 * - x: 現在フォーカス中の行のチェックボックストグル
 * - Enter: 現在フォーカス中の行のInspectorを開く
 * - Escape: Inspectorを閉じる / フォーカスをクリア
 * - /: 検索フィールドにフォーカス
 *
 * @example
 * ```tsx
 * const searchInputRef = useRef<HTMLInputElement>(null)
 * const itemIds = items.map(item => item.id)
 *
 * useInboxKeyboardShortcuts({
 *   itemIds,
 *   searchInputRef,
 *   enabled: true
 * })
 * ```
 */
export function useInboxKeyboardShortcuts({
  itemIds,
  searchInputRef,
  enabled = true,
}: UseInboxKeyboardShortcutsOptions) {
  const { focusedId, focusNext, focusPrevious, clearFocus } = useInboxFocusStore()
  const { toggleSelection } = useInboxSelectionStore()
  const { openInspector, closeInspector, isOpen } = useTicketInspectorStore()

  // イベントハンドラが常に最新の値を参照できるようにrefで保持
  const itemIdsRef = useRef(itemIds)
  useEffect(() => {
    itemIdsRef.current = itemIds
  }, [itemIds])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は / 以外のショートカットを無効化
      const target = e.target as HTMLElement
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // / キーで検索フィールドにフォーカス
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault()
        searchInputRef?.current?.focus()
        return
      }

      // Escape キーでInspectorを閉じる、またはフォーカスをクリア
      if (e.key === 'Escape') {
        if (isOpen) {
          closeInspector()
        } else {
          clearFocus()
        }
        return
      }

      // 入力フィールドにフォーカスがある場合は以降のショートカットを無効化
      if (isInputFocused) return

      // j キーで次の行にフォーカス
      if (e.key === 'j') {
        e.preventDefault()
        focusNext(itemIdsRef.current)
        return
      }

      // k キーで前の行にフォーカス
      if (e.key === 'k') {
        e.preventDefault()
        focusPrevious(itemIdsRef.current)
        return
      }

      // x キーでチェックボックストグル
      if (e.key === 'x' && focusedId) {
        e.preventDefault()
        toggleSelection(focusedId)
        return
      }

      // Enter キーでInspectorを開く
      if (e.key === 'Enter' && focusedId) {
        e.preventDefault()
        openInspector(focusedId)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    enabled,
    focusedId,
    focusNext,
    focusPrevious,
    toggleSelection,
    openInspector,
    closeInspector,
    isOpen,
    clearFocus,
    searchInputRef,
  ])
}
