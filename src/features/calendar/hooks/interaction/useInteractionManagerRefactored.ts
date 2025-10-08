/**
 * リファクタリング後のインタラクション管理フック
 * 各機能を分離したフックを組み合わせて提供
 */

'use client'

import { useCallback } from 'react'

import { useDragInteraction, type DragResult } from './useDragInteraction'
import { useEventCreation, type CreatingEvent } from './useEventCreation'
import { useEventSelection } from './useEventSelection'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

export interface UseInteractionManagerRefactoredOptions {
  onEscape?: () => void
  onConfirmCreate?: (event: CreatingEvent) => void
  onSelectionChange?: (eventId: string | null) => void
}

export function useInteractionManagerRefactored(options: UseInteractionManagerRefactoredOptions = {}) {
  const { onEscape, onConfirmCreate, onSelectionChange } = options

  // 各機能のフックを初期化
  const eventSelection = useEventSelection({ onSelectionChange })
  const dragInteraction = useDragInteraction({
    onDragComplete: handleDragComplete,
  })
  const eventCreation = useEventCreation({
    onConfirmCreate,
    defaultDurationMinutes: 30,
  })

  // ドラッグ完了時の処理
  function handleDragComplete(result: DragResult) {
    if (result.isValid) {
      eventCreation.actions.startCreating(result.date, result.startTime, result.endTime)
    }
  }

  // キーボードショートカットの設定
  const keyboardActions = {
    onEscape: useCallback(() => {
      if (dragInteraction.state.isDragging) {
        dragInteraction.actions.cancelDrag()
      } else if (eventCreation.state.isCreating) {
        eventCreation.actions.cancelCreating()
      } else if (eventSelection.state.selectedEventId) {
        eventSelection.actions.selectEvent(null)
      }
      onEscape?.()
    }, [
      dragInteraction.state.isDragging,
      eventCreation.state.isCreating,
      eventSelection.state.selectedEventId,
      dragInteraction.actions,
      eventCreation.actions,
      eventSelection.actions,
      onEscape,
    ]),

    onEnter: useCallback(() => {
      if (eventCreation.state.isCreating && eventCreation.state.creatingEvent) {
        eventCreation.actions.confirmCreate()
      }
    }, [eventCreation.state, eventCreation.actions]),
  }

  useKeyboardShortcuts({
    isActive: true,
    actions: keyboardActions,
  })

  // タイムスロットホバー機能（シンプル化）
  const setHoveredTimeSlot = useCallback((_date: Date | null, _time: string | null) => {
    // 実装は必要に応じて追加
  }, [])

  // 統合された状態とアクション
  return {
    state: {
      // イベント選択
      selectedEventId: eventSelection.state.selectedEventId,
      hoveredEventId: eventSelection.state.hoveredEventId,

      // ドラッグ
      isDragging: dragInteraction.state.isDragging,
      dragStartTime: dragInteraction.state.dragStartTime,
      dragEndTime: dragInteraction.state.dragEndTime,
      dragDate: dragInteraction.state.dragDate,

      // イベント作成
      isCreating: eventCreation.state.isCreating,
      creatingEvent: eventCreation.state.creatingEvent,

      // レガシー互換性のため
      hoveredTimeSlot: null,
    },
    actions: {
      // イベント選択
      selectEvent: eventSelection.actions.selectEvent,
      setHoveredEvent: eventSelection.actions.setHoveredEvent,
      setHoveredTimeSlot,

      // ドラッグ
      startDrag: dragInteraction.actions.startDrag,
      updateDrag: dragInteraction.actions.updateDrag,
      endDrag: dragInteraction.actions.endDrag,
      cancelDrag: dragInteraction.actions.cancelDrag,

      // イベント作成
      startCreating: eventCreation.actions.startCreating,
      finishCreating: eventCreation.actions.confirmCreate,
      cancelCreating: eventCreation.actions.cancelCreating,

      // 全体リセット
      resetState: useCallback(() => {
        eventSelection.actions.clearSelection()
        dragInteraction.actions.cancelDrag()
        eventCreation.actions.cancelCreating()
      }, [eventSelection.actions, dragInteraction.actions, eventCreation.actions]),
    },
  }
}
