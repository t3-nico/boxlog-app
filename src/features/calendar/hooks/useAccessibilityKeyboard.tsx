// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { CalendarEvent } from '@/features/calendar/types/calendar.types'
import { useI18n } from '@/features/i18n/lib/hooks'

import { handleActionKeys, handleArrowKeys, handleEventDetailKeys, handleNavigationKeys } from './keyboardHandlers'

export interface NavigationState {
  selectedDate: Date
  selectedTime: string
  selectedEventId: string | null
  focusedElement: string | null
  isInEventCreationMode: boolean
  isInEventEditMode: boolean
}

interface KeyboardCallbacks {
  onCreateEvent: (date: Date, time: string) => void
  onEditEvent: (eventId: string) => void
  onDeleteEvent: (eventId: string) => void
  onSelectEvent: (eventId: string) => void
  onNavigateDate: (date: Date) => void
  onNavigateTime: (time: string) => void
  onEscapeAction: () => void
}

interface AccessibilityAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

// 時間スロットの定義（15分刻み）
const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4)
  const minutes = (i % 4) * 15
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
})

export function useAccessibilityKeyboard(events: CalendarEvent[], currentDate: Date, callbacks: KeyboardCallbacks) {
  const { t } = useI18n()
  const [navigationState, setNavigationState] = useState<NavigationState>({
    selectedDate: new Date(currentDate),
    selectedTime: '09:00',
    selectedEventId: null,
    focusedElement: null,
    isInEventCreationMode: false,
    isInEventEditMode: false,
  })

  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([])
  const announcementTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * スクリーンリーダー用のアナウンス
   */
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      timestamp: Date.now(),
    }

    setAnnouncements((prev) => [...prev.slice(-9), announcement]) // 最新10件のみ保持

    // 自動クリーンアップ
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current)
    }

    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.timestamp !== announcement.timestamp))
    }, 5000)
  }, [])

  /**
   * 日付の移動
   */
  const navigateDate = useCallback(
    (direction: 'next' | 'previous', unit: 'day' | 'week') => {
      setNavigationState((prev) => {
        const newDate = new Date(prev.selectedDate)
        const multiplier = direction === 'next' ? 1 : -1
        const amount = unit === 'day' ? 1 : 7

        newDate.setDate(newDate.getDate() + amount * multiplier)

        const dateString = newDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })

        announce(`${dateString}に移動しました`)
        callbacks.onNavigateDate(newDate)

        return { ...prev, selectedDate: newDate }
      })
    },
    [announce, callbacks]
  )

  /**
   * 時間の移動
   */
  const navigateTime = useCallback(
    (direction: 'next' | 'previous') => {
      setNavigationState((prev) => {
        const currentIndex = TIME_SLOTS.indexOf(prev.selectedTime)
        const newIndex =
          direction === 'next' ? Math.min(currentIndex + 1, TIME_SLOTS.length - 1) : Math.max(currentIndex - 1, 0)

        const newTime = TIME_SLOTS[newIndex]
        announce(`${newTime}に移動しました`)
        callbacks.onNavigateTime(newTime)

        return { ...prev, selectedTime: newTime }
      })
    },
    [announce, callbacks]
  )

  /**
   * イベント間の移動
   */
  const navigateEvents = useCallback(
    (direction: 'next' | 'previous') => {
      const currentDateEvents = events
        .filter(
          (event) => event.startDate && event.startDate.toDateString() === navigationState.selectedDate.toDateString()
        )
        .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

      if (currentDateEvents.length === 0) {
        announce(t('calendar.event.noEventsOnThisDay'))
        return
      }

      setNavigationState((prev) => {
        const currentIndex = prev.selectedEventId
          ? currentDateEvents.findIndex((e) => e.id === prev.selectedEventId)
          : -1

        let newIndex: number
        if (direction === 'next') {
          newIndex = currentIndex < currentDateEvents.length - 1 ? currentIndex + 1 : 0
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : currentDateEvents.length - 1
        }

        const newEvent = currentDateEvents[newIndex]
        if (!newEvent) return prev

        const timeString = newEvent.startDate?.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        })

        announce(`${timeString} ${newEvent.title}`)
        callbacks.onSelectEvent(newEvent.id)

        return { ...prev, selectedEventId: newEvent.id }
      })
    },
    [events, navigationState.selectedDate, announce, callbacks, t]
  )

  /**
   * イベント作成
   */
  const createEvent = useCallback(() => {
    setNavigationState((prev) => {
      announce(`${prev.selectedTime}に新しいイベントを作成します`)
      callbacks.onCreateEvent(prev.selectedDate, prev.selectedTime)

      return { ...prev, isInEventCreationMode: true }
    })
  }, [announce, callbacks])

  /**
   * イベント編集
   */
  const editCurrentEvent = useCallback(() => {
    if (navigationState.selectedEventId) {
      const event = events.find((e) => e.id === navigationState.selectedEventId)
      if (event) {
        announce(`${event.title}を編集します`)
        callbacks.onEditEvent(navigationState.selectedEventId)

        setNavigationState((prev) => ({ ...prev, isInEventEditMode: true }))
      }
    } else {
      announce(t('calendar.event.selectEventToEdit'))
    }
  }, [navigationState.selectedEventId, events, announce, callbacks, t])

  /**
   * イベント削除
   */
  const deleteCurrentEvent = useCallback(() => {
    if (navigationState.selectedEventId) {
      const event = events.find((e) => e.id === navigationState.selectedEventId)
      if (event) {
        announce(`${event.title}を削除します`)
        callbacks.onDeleteEvent(navigationState.selectedEventId)

        setNavigationState((prev) => ({
          ...prev,
          selectedEventId: null,
        }))
      }
    } else {
      announce(t('calendar.event.selectEventToDelete'))
    }
  }, [navigationState.selectedEventId, events, announce, callbacks, t])

  /**
   * エスケープアクション
   */
  const handleEscape = useCallback(() => {
    setNavigationState((prev) => {
      if (prev.isInEventCreationMode || prev.isInEventEditMode) {
        announce(t('calendar.actions.undone'))
        callbacks.onEscapeAction()
        return {
          ...prev,
          isInEventCreationMode: false,
          isInEventEditMode: false,
        }
      } else if (prev.selectedEventId) {
        announce(t('calendar.event.deselected'))
        return { ...prev, selectedEventId: null }
      }
      return prev
    })
  }, [announce, callbacks, t])

  /**
   * ヘルプメッセージの表示
   */
  const showKeyboardHelp = useCallback(() => {
    const helpMessage = [
      'カレンダーのキーボード操作:',
      '矢印キー: 日付・時間・イベントの移動',
      'Enter: イベント作成・編集',
      'Delete: イベント削除',
      'Escape: 操作キャンセル',
      'F1: このヘルプを表示',
      'Home/End: 時間の最初・最後に移動',
      'PageUp/PageDown: 週単位で移動',
    ].join('。')

    announce(helpMessage, 'assertive')
  }, [announce])

  /**
   * キーボードイベントハンドラー
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // モーダルやフォームが開いている場合は処理しない
      if (
        navigationState.isInEventCreationMode ||
        navigationState.isInEventEditMode ||
        event.target !== document.body
      ) {
        return
      }

      const { ctrlKey, altKey } = event

      // 修飾キーの組み合わせチェック
      if (ctrlKey || altKey) return

      // キーボードハンドラーを分割して呼び出し
      const handlerProps = {
        event,
        navigationState,
        navigateDate,
        navigateTime,
        navigateEvents,
        editCurrentEvent,
        createEvent,
        deleteCurrentEvent,
        handleEscape,
        showKeyboardHelp,
        setNavigationState,
        announce,
        events,
        TIME_SLOTS,
        noDescriptionText: t('calendar.event.noDescription'),
      }

      // ヘルパー関数を直接呼び出し
      handleArrowKeys(handlerProps)
      handleActionKeys(handlerProps)
      handleNavigationKeys(handlerProps)
      handleEventDetailKeys(handlerProps)
    },
    [
      navigationState,
      navigateDate,
      navigateTime,
      navigateEvents,
      createEvent,
      editCurrentEvent,
      deleteCurrentEvent,
      handleEscape,
      showKeyboardHelp,
      events,
      announce,
      t,
    ]
  )

  /**
   * キーボードイベントの登録
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  /**
   * フォーカス管理
   */
  const focusCalendar = useCallback(() => {
    const calendarElement = document.querySelector('[role="grid"]') as HTMLElement
    if (calendarElement) {
      calendarElement.focus()
      announce('カレンダーにフォーカスしました。F1キーでヘルプを表示できます')
    }
  }, [announce])

  /**
   * 現在の状態の詳細説明
   */
  const getDetailedStatus = useCallback(() => {
    const { selectedDate, selectedTime, selectedEventId } = navigationState
    const dateString = selectedDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

    if (selectedEventId) {
      const event = events.find((e) => e.id === selectedEventId)
      if (event) {
        return `${dateString}、${event.title}が選択されています`
      }
    }

    return `${dateString}、${selectedTime}が選択されています`
  }, [navigationState, events])

  return {
    navigationState,
    announcements,
    focusCalendar,
    getDetailedStatus,

    // 手動ナビゲーション用
    navigateToDate: (date: Date) => {
      setNavigationState((prev) => ({ ...prev, selectedDate: date }))
      const dateString = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
      announce(`${dateString}に移動しました`)
    },

    navigateToTime: (time: string) => {
      setNavigationState((prev) => ({ ...prev, selectedTime: time }))
      announce(`${time}に移動しました`)
    },

    selectEvent: (eventId: string | null) => {
      setNavigationState((prev) => ({ ...prev, selectedEventId: eventId }))
      if (eventId) {
        const event = events.find((e) => e.id === eventId)
        if (event) {
          announce(`${event.title}を選択しました`)
        }
      }
    },

    // モード制御
    setEventCreationMode: (isActive: boolean) => {
      setNavigationState((prev) => ({ ...prev, isInEventCreationMode: isActive }))
    },

    setEventEditMode: (isActive: boolean) => {
      setNavigationState((prev) => ({ ...prev, isInEventEditMode: isActive }))
    },

    // アナウンス機能
    announce,
  }
}

// スクリーンリーダー用のライブリージョンコンポーネント
export const AccessibilityLiveRegion = ({ announcements }: { announcements: AccessibilityAnnouncement[] }) => {
  return (
    <>
      {/* polite な更新用 */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {announcements
          .filter((a) => a.priority === 'polite')
          .slice(-1)
          .map((a) => a.message)
          .join('')}
      </div>

      {/* 緊急な更新用 */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only" role="alert">
        {announcements
          .filter((a) => a.priority === 'assertive')
          .slice(-1)
          .map((a) => a.message)
          .join('')}
      </div>
    </>
  )
}
