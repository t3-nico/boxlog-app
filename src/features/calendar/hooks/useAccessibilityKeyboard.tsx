'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { markAsTranslated } from '@/types/i18n-branded'
import { useTranslations } from 'next-intl'

import { handleActionKeys, handleArrowKeys, handleNavigationKeys, handlePlanDetailKeys } from './keyboardHandlers'

export interface NavigationState {
  selectedDate: Date
  selectedTime: string
  selectedPlanId: string | null
  focusedElement: string | null
  isInPlanCreationMode: boolean
  isInPlanEditMode: boolean
}

interface KeyboardCallbacks {
  onCreatePlan: (date: Date, time: string) => void
  onEditPlan: (planId: string) => void
  onDeletePlan: (planId: string) => void
  onSelectPlan: (planId: string) => void
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

export function useAccessibilityKeyboard(plans: CalendarPlan[], currentDate: Date, callbacks: KeyboardCallbacks) {
  const t = useTranslations()
  const [navigationState, setNavigationState] = useState<NavigationState>({
    selectedDate: new Date(currentDate),
    selectedTime: '09:00',
    selectedPlanId: null,
    focusedElement: null,
    isInPlanCreationMode: false,
    isInPlanEditMode: false,
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

        const newTime = TIME_SLOTS[newIndex]!
        announce(`${newTime}に移動しました`)
        callbacks.onNavigateTime(newTime)

        return { ...prev, selectedTime: newTime }
      })
    },
    [announce, callbacks]
  )

  /**
   * プラン間の移動
   */
  const navigatePlans = useCallback(
    (direction: 'next' | 'previous') => {
      const currentDatePlans = plans
        .filter(
          (plan) => plan.startDate && plan.startDate.toDateString() === navigationState.selectedDate.toDateString()
        )
        .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

      if (currentDatePlans.length === 0) {
        announce(t('calendar.plan.noPlansOnThisDay'))
        return
      }

      setNavigationState((prev) => {
        const currentIndex = prev.selectedPlanId ? currentDatePlans.findIndex((p) => p.id === prev.selectedPlanId) : -1

        let newIndex: number
        if (direction === 'next') {
          newIndex = currentIndex < currentDatePlans.length - 1 ? currentIndex + 1 : 0
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : currentDatePlans.length - 1
        }

        const newPlan = currentDatePlans[newIndex]
        if (!newPlan) return prev

        const timeString = newPlan.startDate?.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        })

        announce(`${timeString} ${newPlan.title}`)
        callbacks.onSelectPlan(newPlan.id)

        return { ...prev, selectedPlanId: newPlan.id }
      })
    },
    [plans, navigationState.selectedDate, announce, callbacks, t]
  )

  /**
   * プラン作成
   */
  const createPlan = useCallback(() => {
    setNavigationState((prev) => {
      announce(`${prev.selectedTime}に新しいプランを作成します`)
      callbacks.onCreatePlan(prev.selectedDate, prev.selectedTime)

      return { ...prev, isInPlanCreationMode: true }
    })
  }, [announce, callbacks])

  /**
   * プラン編集
   */
  const editCurrentPlan = useCallback(() => {
    if (navigationState.selectedPlanId) {
      const plan = plans.find((p) => p.id === navigationState.selectedPlanId)
      if (plan) {
        announce(`${plan.title}を編集します`)
        callbacks.onEditPlan(navigationState.selectedPlanId)

        setNavigationState((prev) => ({ ...prev, isInPlanEditMode: true }))
      }
    } else {
      announce(t('calendar.plan.selectPlanToEdit'))
    }
  }, [navigationState.selectedPlanId, plans, announce, callbacks, t])

  /**
   * プラン削除
   */
  const deleteCurrentPlan = useCallback(() => {
    if (navigationState.selectedPlanId) {
      const plan = plans.find((p) => p.id === navigationState.selectedPlanId)
      if (plan) {
        announce(`${plan.title}を削除します`)
        callbacks.onDeletePlan(navigationState.selectedPlanId)

        setNavigationState((prev) => ({
          ...prev,
          selectedPlanId: null,
        }))
      }
    } else {
      announce(t('calendar.plan.selectPlanToDelete'))
    }
  }, [navigationState.selectedPlanId, plans, announce, callbacks, t])

  /**
   * エスケープアクション
   */
  const handleEscape = useCallback(() => {
    setNavigationState((prev) => {
      if (prev.isInPlanCreationMode || prev.isInPlanEditMode) {
        announce(t('calendar.actions.undone'))
        callbacks.onEscapeAction()
        return {
          ...prev,
          isInPlanCreationMode: false,
          isInPlanEditMode: false,
        }
      } else if (prev.selectedPlanId) {
        announce(t('calendar.plan.deselected'))
        return { ...prev, selectedPlanId: null }
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
      '矢印キー: 日付・時間・プランの移動',
      'Enter: プラン作成・編集',
      'Delete: プラン削除',
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
      if (navigationState.isInPlanCreationMode || navigationState.isInPlanEditMode || event.target !== document.body) {
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
        navigateEvents: navigatePlans,
        editCurrentEvent: editCurrentPlan,
        createEvent: createPlan,
        deleteCurrentEvent: deleteCurrentPlan,
        handleEscape,
        showKeyboardHelp,
        setNavigationState,
        announce,
        events: plans as Array<{
          id: string
          title: string
          startDate?: Date | null
          endDate?: Date | null
          description?: string
        }>,
        TIME_SLOTS,
        noDescriptionText: markAsTranslated(t('calendar.plan.noDescription')),
      }

      // ヘルパー関数を直接呼び出し
      handleArrowKeys(handlerProps)
      handleActionKeys(handlerProps)
      handleNavigationKeys(handlerProps)
      handlePlanDetailKeys(handlerProps)
    },
    [
      navigationState,
      navigateDate,
      navigateTime,
      navigatePlans,
      createPlan,
      editCurrentPlan,
      deleteCurrentPlan,
      handleEscape,
      showKeyboardHelp,
      plans,
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
    const { selectedDate, selectedTime, selectedPlanId } = navigationState
    const dateString = selectedDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

    if (selectedPlanId) {
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (plan) {
        return `${dateString}、${plan.title}が選択されています`
      }
    }

    return `${dateString}、${selectedTime}が選択されています`
  }, [navigationState, plans])

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

    selectPlan: (planId: string | null) => {
      setNavigationState((prev) => ({ ...prev, selectedPlanId: planId }))
      if (planId) {
        const plan = plans.find((p) => p.id === planId)
        if (plan) {
          announce(`${plan.title}を選択しました`)
        }
      }
    },

    // モード制御
    setPlanCreationMode: (isActive: boolean) => {
      setNavigationState((prev) => ({ ...prev, isInPlanCreationMode: isActive }))
    },

    setPlanEditMode: (isActive: boolean) => {
      setNavigationState((prev) => ({ ...prev, isInPlanEditMode: isActive }))
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
