import type { TranslatedString } from '@/types/i18n-branded'
import { NavigationState } from './useAccessibilityKeyboard'

export interface KeyboardHandlerProps {
  event: KeyboardEvent
  navigationState: NavigationState
  navigateDate: (direction: 'next' | 'previous', unit: 'day' | 'week') => void
  navigateTime: (direction: 'next' | 'previous') => void
  navigateEvents: (direction: 'next' | 'previous') => void
  editCurrentEvent: () => void
  createEvent: () => void
  deleteCurrentEvent: () => void
  handleEscape: () => void
  showKeyboardHelp: () => void
  setNavigationState: (updater: (prev: NavigationState) => NavigationState) => void
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  events: { id: string; title: string; startDate?: Date | null; endDate?: Date | null; description?: string }[]
  TIME_SLOTS: string[]
  noDescriptionText: TranslatedString // 翻訳文字列
}

export const handleArrowKeys = ({
  event,
  navigationState,
  navigateDate,
  navigateTime,
  navigateEvents,
}: Pick<KeyboardHandlerProps, 'event' | 'navigationState' | 'navigateDate' | 'navigateTime' | 'navigateEvents'>) => {
  const { key, shiftKey } = event

  switch (key) {
    case 'ArrowRight':
      event.preventDefault()
      if (shiftKey) {
        navigateDate('next', 'week')
      } else {
        navigateDate('next', 'day')
      }
      break

    case 'ArrowLeft':
      event.preventDefault()
      if (shiftKey) {
        navigateDate('previous', 'week')
      } else {
        navigateDate('previous', 'day')
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      if (navigationState.selectedPlanId) {
        navigateEvents('previous')
      } else {
        navigateTime('previous')
      }
      break

    case 'ArrowDown':
      event.preventDefault()
      if (navigationState.selectedPlanId) {
        navigateEvents('next')
      } else {
        navigateTime('next')
      }
      break
  }
}

export const handleActionKeys = ({
  event,
  navigationState,
  navigateEvents,
  editCurrentEvent,
  createEvent,
  deleteCurrentEvent,
  handleEscape,
}: Pick<
  KeyboardHandlerProps,
  | 'event'
  | 'navigationState'
  | 'navigateEvents'
  | 'editCurrentEvent'
  | 'createEvent'
  | 'deleteCurrentEvent'
  | 'handleEscape'
>) => {
  const { key, shiftKey } = event

  switch (key) {
    case 'Tab':
      if (!shiftKey) {
        event.preventDefault()
        navigateEvents('next')
      }
      break

    case 'Enter':
      event.preventDefault()
      if (navigationState.selectedPlanId) {
        editCurrentEvent()
      } else {
        createEvent()
      }
      break

    case 'Delete':
    case 'Backspace':
      event.preventDefault()
      deleteCurrentEvent()
      break

    case 'Escape':
      event.preventDefault()
      handleEscape()
      break
  }
}

export const handleNavigationKeys = ({
  event,
  showKeyboardHelp,
  navigateDate,
  setNavigationState,
  announce,
  TIME_SLOTS,
}: Pick<
  KeyboardHandlerProps,
  'event' | 'showKeyboardHelp' | 'navigateDate' | 'setNavigationState' | 'announce' | 'TIME_SLOTS'
>) => {
  const { key } = event

  switch (key) {
    case 'F1':
      event.preventDefault()
      showKeyboardHelp()
      break

    case 'Home':
      event.preventDefault()
      setNavigationState((prev) => ({ ...prev, selectedTime: TIME_SLOTS[0]! }))
      announce(`${TIME_SLOTS[0]!}に移動しました`)
      break

    case 'End':
      event.preventDefault()
      setNavigationState((prev) => ({ ...prev, selectedTime: TIME_SLOTS[TIME_SLOTS.length - 1]! }))
      announce(`${TIME_SLOTS[TIME_SLOTS.length - 1]!}に移動しました`)
      break

    case 'PageUp':
      event.preventDefault()
      navigateDate('previous', 'week')
      break

    case 'PageDown':
      event.preventDefault()
      navigateDate('next', 'week')
      break
  }
}

export const handlePlanDetailKeys = ({
  event,
  navigationState,
  events,
  announce,
  noDescriptionText,
}: Pick<KeyboardHandlerProps, 'event' | 'navigationState' | 'events' | 'announce' | 'noDescriptionText'>) => {
  const { key } = event

  if (key === ' ') {
    // スペースキー
    event.preventDefault()
    if (navigationState.selectedPlanId) {
      const selectedEvent = events.find((e) => e.id === navigationState.selectedPlanId)
      if (selectedEvent) {
        const timeString = selectedEvent.startDate?.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const endTimeString = selectedEvent.endDate?.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        })
        announce(
          `${selectedEvent.title}。${timeString}から${endTimeString}まで。${selectedEvent.description || noDescriptionText}`
        )
      }
    }
  }
}

// 互換性のためのエイリアス
/** @deprecated Use handlePlanDetailKeys instead */
export const handleEventDetailKeys = handlePlanDetailKeys
