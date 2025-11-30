/**
 * リファクタリング後のドラッグ&ドロップフック
 * 複雑度を大幅に削減し、責任を分離
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import { useDragCalculations } from './drag-operations/useDragCalculations'
import { useDragElement } from './drag-operations/useDragElement'
import { useDragState } from './drag-operations/useDragState'
import { useEventUpdate } from './drag-operations/usePlanUpdate'

interface UseDragAndDropRefactoredProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  onEventClick?: (plan: CalendarPlan) => void
  date: Date
  events: CalendarPlan[]
  displayDates?: Date[]
  viewMode?: 'day' | 'week' | '2week' | '3day' | '5day'
}

export function useDragAndDropRefactored({
  onEventUpdate,
  onEventClick,
  date,
  events,
  displayDates,
  viewMode = 'day',
}: UseDragAndDropRefactoredProps) {
  // 分離されたフックを使用
  const { dragState, updateDragState, resetDragState, startDrag, startResize, completeDragOperation } = useDragState()

  const { executeEventUpdate, executeEventResize } = useEventUpdate({
    onEventUpdate,
    events,
    date,
  })

  const { createDragElement, updateDragElementPosition, updateDragElementTime, cleanupDragElements } = useDragElement()

  const {
    calculateNewTime,
    getConstrainedPosition,
    calculateTargetDateIndex,
    calculateTargetDate,
    calculateDragMovement,
    calculateResizeMovement,
  } = useDragCalculations()

  // ドラッグデータの参照
  const dragDataRef = useRef<{
    eventId: string
    startX: number
    startY: number
    originalTop: number
    eventDuration: number
    hasMoved: boolean
    originalElement: HTMLElement | null
    originalDateIndex: number
    columnWidth: number
    initialRect?: DOMRect
  } | null>(null)

  // マウスダウン処理
  const handleMouseDown = useCallback(
    (
      eventId: string,
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex = 0
    ) => {
      if (e.button !== 0) return // 左クリック以外は無視

      e.preventDefault()
      e.stopPropagation()

      const startPosition = { x: e.clientX, y: e.clientY }
      const originalElement = (e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement

      // カラム幅を計算
      let columnWidth = 0
      if (viewMode !== 'day' && displayDates) {
        const gridContainer = originalElement?.closest('.flex') as HTMLElement
        if (gridContainer?.offsetWidth > 0) {
          columnWidth = gridContainer.offsetWidth / displayDates.length
        } else {
          columnWidth = (window.innerWidth / displayDates.length) * 0.75
        }
      }

      // ドラッグ要素作成
      let dragElement: HTMLElement | null = null
      let initialRect: DOMRect | undefined = undefined
      if (originalElement) {
        const result = createDragElement(originalElement)
        dragElement = result.dragElement
        initialRect = result.initialRect
      }

      // ドラッグデータ設定
      dragDataRef.current = {
        eventId,
        startX: e.clientX,
        startY: e.clientY,
        originalTop: originalPosition.top,
        eventDuration: originalPosition.height,
        hasMoved: false,
        originalElement,
        originalDateIndex: dateIndex,
        columnWidth,
        initialRect,
      }

      startDrag(eventId, startPosition, originalPosition, dateIndex)
      updateDragState({ dragElement })
    },
    [createDragElement, viewMode, displayDates, startDrag, updateDragState]
  )

  // マウス移動処理
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if ((!dragState.isDragging && !dragState.isResizing) || !dragDataRef.current) return

      const dragData = dragDataRef.current
      const { constrainedX, constrainedY } = getConstrainedPosition(e.clientX, e.clientY)
      const deltaX = constrainedX - dragData.startX
      const deltaY = constrainedY - dragData.startY

      // 移動閾値チェック
      if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
        dragData.hasMoved = true
      }

      const targetDateIndex = calculateTargetDateIndex(
        constrainedX,
        dragData.originalDateIndex,
        dragData.hasMoved,
        dragData.columnWidth,
        displayDates || [],
        dragData.originalElement ?? undefined,
        viewMode
      )

      if (dragState.isResizing) {
        // リサイズ処理
        const { finalHeight, originalTop } = calculateResizeMovement(
          dragData.originalTop,
          dragData.eventDuration,
          deltaY
        )

        const event = events.find((e) => e.id === dragData.eventId)
        let previewTime = null

        if (event?.startDate) {
          const newDurationMs = (finalHeight / 60) * 60 * 60 * 1000 // HOUR_HEIGHT = 60
          const previewEndTime = new Date(event.startDate.getTime() + newDurationMs)
          previewTime = { start: event.startDate, end: previewEndTime }
        }

        updateDragState({
          currentPosition: { x: constrainedX, y: constrainedY },
          snappedPosition: { top: originalTop, height: finalHeight },
          previewTime,
        })
      } else if (dragState.isDragging) {
        // ドラッグ処理
        const { snappedTop, snappedLeft, hour, minute } = calculateDragMovement(
          dragData.originalTop,
          deltaY,
          targetDateIndex,
          displayDates,
          viewMode
        )

        // ドラッグ要素の位置更新
        if (dragData.initialRect) {
          const newLeft = dragData.initialRect.left + deltaX
          const newTop = dragData.initialRect.top + deltaY
          updateDragElementPosition(newLeft, newTop)
        }

        // プレビュー時間計算
        const targetDate = calculateTargetDate(targetDateIndex, date, displayDates, viewMode)
        const event = events.find((e) => e.id === dragData.eventId)

        let durationMs = 60 * 60 * 1000
        if (event?.startDate && event?.endDate) {
          durationMs = event.endDate.getTime() - event.startDate.getTime()
        }

        const previewStartTime = new Date(targetDate)
        previewStartTime.setHours(hour, minute, 0, 0)
        const previewEndTime = new Date(previewStartTime.getTime() + durationMs)

        // ドラッグ要素の時間表示更新
        updateDragElementTime(previewStartTime, previewEndTime)

        updateDragState({
          currentPosition: { x: constrainedX, y: constrainedY },
          snappedPosition: { top: snappedTop, left: snappedLeft },
          previewTime: { start: previewStartTime, end: previewEndTime },
          targetDateIndex,
        })
      }
    },
    [
      dragState,
      getConstrainedPosition,
      calculateTargetDateIndex,
      calculateResizeMovement,
      calculateDragMovement,
      calculateTargetDate,
      updateDragElementPosition,
      updateDragElementTime,
      updateDragState,
      events,
      displayDates,
      viewMode,
      date,
    ]
  )

  // マウスアップ処理
  const handleMouseUp = useCallback(async () => {
    cleanupDragElements()

    // クリック処理
    if (!dragDataRef.current?.hasMoved && onEventClick && dragDataRef.current?.eventId) {
      const eventToClick = events.find((e) => e.id === dragDataRef.current!.eventId)
      if (eventToClick) {
        resetDragState()
        onEventClick(eventToClick)
        return
      }
    }

    if (
      (!dragState.isDragging && !dragState.isResizing) ||
      !dragDataRef.current ||
      !dragState.currentPosition ||
      !dragState.dragStartPosition
    ) {
      resetDragState()
      return
    }

    if (dragState.isResizing) {
      // リサイズ処理
      if (dragState.snappedPosition?.height) {
        await executeEventResize(
          dragDataRef.current.eventId,
          dragState.snappedPosition.height,
          dragDataRef.current.hasMoved
        )
      }
    } else if (dragState.isDragging) {
      // ドラッグ処理
      const deltaY = dragState.currentPosition.y - dragState.dragStartPosition.y
      const newTop = dragDataRef.current.originalTop + deltaY
      const targetDateIndex = dragState.targetDateIndex ?? dragDataRef.current.originalDateIndex
      const targetDate = calculateTargetDate(targetDateIndex, date, displayDates, viewMode)
      const newStartTime = calculateNewTime(newTop, targetDate)

      await executeEventUpdate(
        dragDataRef.current.eventId,
        newStartTime,
        dragDataRef.current.eventDuration,
        dragDataRef.current.hasMoved
      )
    }

    const actuallyMoved = dragDataRef.current?.hasMoved || false
    completeDragOperation(actuallyMoved)
    dragDataRef.current = null
  }, [
    cleanupDragElements,
    dragState,
    onEventClick,
    events,
    resetDragState,
    executeEventResize,
    executeEventUpdate,
    calculateTargetDate,
    calculateNewTime,
    completeDragOperation,
    date,
    displayDates,
    viewMode,
  ])

  // リサイズ開始処理
  const handleResizeStart = useCallback(
    (
      eventId: string,
      _direction: 'top' | 'bottom',
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number }
    ) => {
      if (e.button !== 0) return

      const startPosition = { x: e.clientX, y: e.clientY }

      dragDataRef.current = {
        eventId,
        startX: e.clientX,
        startY: e.clientY,
        originalTop: originalPosition.top,
        eventDuration: originalPosition.height,
        hasMoved: false,
        originalElement: null,
        originalDateIndex: 0,
        columnWidth: 0,
      }

      startResize(eventId, startPosition, originalPosition)
    },
    [startResize]
  )

  // イベントドロップヘルパー
  const handleEventDrop = useCallback(
    (eventId: string, newStartTime: Date) => {
      if (onEventUpdate) {
        const event = events.find((e) => e.id === eventId)
        let durationMs = 60 * 60 * 1000

        if (event?.startDate && event?.endDate) {
          durationMs = event.endDate.getTime() - event.startDate.getTime()
        }

        const newEndTime = new Date(newStartTime.getTime() + durationMs)
        onEventUpdate(eventId, { startTime: newStartTime, endTime: newEndTime })
      }
    },
    [onEventUpdate, events]
  )

  // グローバルマウスイベント設定
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return undefined
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp])

  return {
    dragState,
    handlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleEventDrop,
      handleResizeStart,
    },
  }
}
