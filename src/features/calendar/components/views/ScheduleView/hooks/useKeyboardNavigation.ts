import { useEffect, useCallback, useRef } from 'react'
import type { ScheduleEvent, KeyboardShortcut } from '../ScheduleView.types'

interface UseKeyboardNavigationProps {
  events: ScheduleEvent[]
  onEventSelect?: (event: ScheduleEvent) => void
  onEventEdit?: (event: ScheduleEvent) => void
  onEventDelete?: (eventId: string) => void
  onDateClick?: (date: Date) => void
  onScrollToToday?: () => void
  onScrollToNext?: () => void
  enabled?: boolean
}

/**
 * キーボードナビゲーションとアクセシビリティ機能を提供するフック
 */
export function useKeyboardNavigation({
  events,
  onEventSelect,
  onEventEdit,
  onEventDelete,
  onDateClick,
  onScrollToToday,
  onScrollToNext,
  enabled = true
}: UseKeyboardNavigationProps) {
  const currentFocusIndex = useRef<number>(-1)
  const announcementRef = useRef<HTMLDivElement>(null)

  // スクリーンリーダー向けのアナウンス
  const announce = useCallback((message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message
    }
  }, [])

  // フォーカス可能なイベントのリスト
  const focusableEvents = events.filter(event => !event.isAllDay || event.isAllDay)

  // イベントフォーカス移動
  const moveFocus = useCallback((direction: 'next' | 'prev') => {
    if (focusableEvents.length === 0) return

    const increment = direction === 'next' ? 1 : -1
    let newIndex = currentFocusIndex.current + increment

    // 循環する
    if (newIndex >= focusableEvents.length) {
      newIndex = 0
    } else if (newIndex < 0) {
      newIndex = focusableEvents.length - 1
    }

    currentFocusIndex.current = newIndex
    const focusedEvent = focusableEvents[newIndex]
    
    if (focusedEvent && onEventSelect) {
      onEventSelect(focusedEvent)
      
      // フォーカスした要素にスクロール
      const eventElement = document.getElementById(`schedule-event-${focusedEvent.id}`)
      if (eventElement) {
        eventElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
      
      // アナウンス
      announce(`${focusedEvent.title}にフォーカス`)
    }
  }, [focusableEvents, onEventSelect, announce])

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // 入力フィールドにフォーカスがある場合は無視
    const activeElement = document.activeElement
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    )) {
      return
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event
    const isModifierPressed = ctrlKey || metaKey

    switch (key.toLowerCase()) {
      case 'j':
        // 次のイベントへ
        event.preventDefault()
        moveFocus('next')
        break

      case 'k':
        // 前のイベントへ
        event.preventDefault()
        moveFocus('prev')
        break

      case 't':
        // 今日へジャンプ
        event.preventDefault()
        onScrollToToday?.()
        announce('今日の予定に移動しました')
        break

      case 'n':
        // 次の予定へ
        event.preventDefault()
        onScrollToNext?.()
        announce('次の予定に移動しました')
        break

      case 'c':
        // 新規作成
        if (isModifierPressed) {
          event.preventDefault()
          onDateClick?.(new Date())
          announce('新しい予定の作成を開始します')
        }
        break

      case 'enter':
      case ' ':
        // 選択したイベントを開く
        if (currentFocusIndex.current >= 0 && currentFocusIndex.current < focusableEvents.length) {
          event.preventDefault()
          const focusedEvent = focusableEvents[currentFocusIndex.current]
          onEventSelect?.(focusedEvent)
          announce(`${focusedEvent.title}を開きました`)
        }
        break

      case 'e':
        // 選択したイベントを編集
        if (currentFocusIndex.current >= 0 && currentFocusIndex.current < focusableEvents.length) {
          event.preventDefault()
          const focusedEvent = focusableEvents[currentFocusIndex.current]
          onEventEdit?.(focusedEvent)
          announce(`${focusedEvent.title}の編集を開始します`)
        }
        break

      case 'delete':
      case 'backspace':
        // 選択したイベントを削除（確認あり）
        if (currentFocusIndex.current >= 0 && currentFocusIndex.current < focusableEvents.length) {
          const focusedEvent = focusableEvents[currentFocusIndex.current]
          if (confirm(`「${focusedEvent.title}」を削除しますか？`)) {
            event.preventDefault()
            onEventDelete?.(focusedEvent.id)
            announce(`${focusedEvent.title}を削除しました`)
            
            // フォーカスを次のイベントに移動
            moveFocus('next')
          }
        }
        break

      case 'escape':
        // フォーカス解除
        currentFocusIndex.current = -1
        announce('フォーカスを解除しました')
        break

      case '?':
        // ヘルプ表示
        if (!shiftKey) break
        event.preventDefault()
        showKeyboardHelp()
        break

      case 'arrowdown':
        // 下矢印キー: 次のイベント
        if (!isModifierPressed) {
          event.preventDefault()
          moveFocus('next')
        }
        break

      case 'arrowup':
        // 上矢印キー: 前のイベント
        if (!isModifierPressed) {
          event.preventDefault()
          moveFocus('prev')
        }
        break

      case 'home':
        // 最初のイベントへ
        if (focusableEvents.length > 0) {
          event.preventDefault()
          currentFocusIndex.current = 0
          onEventSelect?.(focusableEvents[0])
          announce('最初の予定に移動しました')
        }
        break

      case 'end':
        // 最後のイベントへ
        if (focusableEvents.length > 0) {
          event.preventDefault()
          currentFocusIndex.current = focusableEvents.length - 1
          onEventSelect?.(focusableEvents[focusableEvents.length - 1])
          announce('最後の予定に移動しました')
        }
        break
    }
  }, [
    enabled,
    moveFocus,
    onScrollToToday,
    onScrollToNext,
    onDateClick,
    onEventSelect,
    onEventEdit,
    onEventDelete,
    focusableEvents,
    announce
  ])

  // ヘルプダイアログ表示
  const showKeyboardHelp = useCallback(() => {
    const shortcuts = [
      'j / ↓ - 次の予定',
      'k / ↑ - 前の予定',
      't - 今日へジャンプ',
      'n - 次の予定へジャンプ',
      'Ctrl/Cmd + c - 新規作成',
      'Enter / Space - 予定を開く',
      'e - 予定を編集',
      'Delete - 予定を削除',
      'Esc - フォーカス解除',
      'Home - 最初の予定',
      'End - 最後の予定',
      '? - このヘルプを表示'
    ].join('\n')

    alert(`キーボードショートカット:\n\n${shortcuts}`)
  }, [])

  // イベントリスナーの設定
  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  // アナウンス要素の作成（React要素を返すのではなく、単なるDOM要素の設定）
  const createAnnouncementElement = useCallback(() => {
    if (typeof window !== 'undefined' && announcementRef.current) {
      announcementRef.current.className = 'sr-only'
      announcementRef.current.setAttribute('role', 'status')
      announcementRef.current.setAttribute('aria-live', 'polite')
      announcementRef.current.setAttribute('aria-atomic', 'true')
    }
  }, [])

  // 現在フォーカス中のイベント
  const focusedEvent = currentFocusIndex.current >= 0 && currentFocusIndex.current < focusableEvents.length
    ? focusableEvents[currentFocusIndex.current]
    : null

  return {
    focusedEvent,
    currentFocusIndex: currentFocusIndex.current,
    moveFocus,
    announce,
    createAnnouncementElement,
    showKeyboardHelp,
    shortcuts: [
      { key: 'j', description: '次の予定', action: () => moveFocus('next') },
      { key: 'k', description: '前の予定', action: () => moveFocus('prev') },
      { key: 't', description: '今日へジャンプ', action: () => onScrollToToday?.() },
      { key: 'n', description: '次の予定へジャンプ', action: () => onScrollToNext?.() },
      { key: 'c', description: '新規作成', action: () => onDateClick?.(new Date()), modifiers: ['ctrl'] },
      { key: '?', description: 'ヘルプ表示', action: showKeyboardHelp, modifiers: ['shift'] },
    ] as KeyboardShortcut[]
  }
}