'use client'

import type React from 'react'
import { useCallback } from 'react'

import { MS_PER_MINUTE } from '@/constants/time'
import useCalendarToast from '@/features/calendar/lib/toast'
import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { useTranslations } from 'next-intl'

import type { DragDataRef, DragState } from './types'
import {
  calculateColumnWidth,
  calculateEventDuration,
  calculatePreviewTime,
  calculateSnappedPosition,
  createDragElement,
  updateDragElementPosition,
  updateTimeDisplay,
} from './utils'

interface UseDragHandlerProps {
  events: CalendarPlan[]
  date: Date
  displayDates: Date[] | undefined
  viewMode: string
  eventUpdateHandler:
    | ((eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void)
    | undefined
  eventClickHandler: ((plan: CalendarPlan) => void) | undefined
  dragDataRef: React.MutableRefObject<DragDataRef | null>
  setDragState: React.Dispatch<React.SetStateAction<DragState>>
}

export function useDragHandler({
  events,
  date,
  displayDates,
  viewMode,
  eventUpdateHandler,
  eventClickHandler,
  dragDataRef,
  setDragState,
}: UseDragHandlerProps) {
  const t = useTranslations()
  const calendarToast = useCalendarToast()

  // ドラッグ開始
  const handleMouseDown = useCallback(
    (
      eventId: string,
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex: number = 0
    ) => {
      if (e.button !== 0) return

      e.preventDefault()
      e.stopPropagation()

      const startPosition = { x: e.clientX, y: e.clientY }
      const originalElement = (e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement
      const columnWidth = calculateColumnWidth(originalElement, viewMode, displayDates)

      let dragElement: HTMLElement | null = null
      let initialRect: DOMRect | null = null
      if (originalElement) {
        const result = createDragElement(originalElement)
        dragElement = result.dragElement
        initialRect = result.initialRect
        originalElement.style.opacity = '0.3'
      }

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
        dragElement,
        initialRect,
      }

      setDragState({
        isDragging: true,
        isResizing: false,
        draggedEventId: eventId,
        dragStartPosition: startPosition,
        currentPosition: startPosition,
        originalPosition,
        snappedPosition: {
          top: originalPosition.top,
          height: originalPosition.height,
        },
        previewTime: null,
        recentlyDragged: false,
        recentlyResized: false,
        dragElement,
        originalDateIndex: dateIndex,
        targetDateIndex: dateIndex,
        ghostElement: null,
      })
    },
    [viewMode, displayDates, dragDataRef, setDragState]
  )

  // ドラッグ処理
  const handleDragging = useCallback(
    (constrainedX: number, constrainedY: number, deltaX: number, deltaY: number, targetDateIndex: number) => {
      const dragData = dragDataRef.current
      if (!dragData) return

      const { snappedTop, snappedLeft, hour, minute } = calculateSnappedPosition(
        dragData.originalTop,
        dragData.originalDateIndex,
        deltaY,
        targetDateIndex,
        viewMode,
        displayDates
      )

      updateDragElementPosition(dragData.dragElement || null, dragData.initialRect || null, deltaX, deltaY)

      const { previewStartTime, previewEndTime } = calculatePreviewTime(
        events,
        dragData.eventId,
        dragData.originalDateIndex,
        dragData.eventDuration,
        hour,
        minute,
        targetDateIndex,
        date,
        viewMode,
        displayDates
      )

      updateTimeDisplay(dragData.dragElement || null, previewStartTime, previewEndTime)

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: constrainedX, y: constrainedY },
        snappedPosition: {
          top: snappedTop,
          ...(snappedLeft !== undefined && { left: snappedLeft }),
        },
        previewTime: { start: previewStartTime, end: previewEndTime },
        targetDateIndex,
      }))
    },
    [events, date, viewMode, displayDates, dragDataRef, setDragState]
  )

  // プランドロップのヘルパー
  const handleEventDrop = useCallback(
    (eventId: string, newStartTime: Date) => {
      if (eventUpdateHandler) {
        const { durationMs } = calculateEventDuration(events, eventId, dragDataRef.current)
        const newEndTime = new Date(newStartTime.getTime() + durationMs)
        eventUpdateHandler(eventId, { startTime: newStartTime, endTime: newEndTime })
      }
    },
    [eventUpdateHandler, events, dragDataRef]
  )

  // クリック処理
  const handleEventClick = useCallback(() => {
    if (!dragDataRef.current || dragDataRef.current.hasMoved || !eventClickHandler) {
      return false
    }

    const eventToClick = events.find((e) => e.id === dragDataRef.current!.eventId)
    if (eventToClick) {
      eventClickHandler(eventToClick)
      return true
    }
    return false
  }, [events, eventClickHandler, dragDataRef])

  // Toast通知を処理する
  const handleEventUpdateToast = useCallback(
    async (promise: Promise<void>, plan: CalendarPlan, newStartTime: Date, durationMs: number) => {
      if (!plan) return

      const previousStartTime = plan.startDate || date
      const timeChanged = Math.abs(newStartTime.getTime() - previousStartTime.getTime()) > 1000

      if (!timeChanged) {
        console.log('🔧 時間変更なし - Toast表示をスキップ:', {
          previousTime: previousStartTime.toISOString(),
          newTime: newStartTime.toISOString(),
          timeDifference: Math.abs(newStartTime.getTime() - previousStartTime.getTime()),
        })
        return
      }

      const eventData: CalendarPlan = {
        id: plan.id,
        title: plan.title || t('calendar.event.title'),
        description: plan.description,
        startDate: newStartTime,
        endDate: new Date(newStartTime.getTime() + durationMs),
        status: plan.status,
        color: plan.color,
        plan_number: plan.plan_number,
        reminder_minutes: plan.reminder_minutes,
        tags: plan.tags,
        createdAt: plan.createdAt,
        updatedAt: new Date(),
        displayStartDate: newStartTime,
        displayEndDate: new Date(newStartTime.getTime() + durationMs),
        duration: Math.round(durationMs / MS_PER_MINUTE),
        isMultiDay: false,
        isRecurring: false,
        type: plan.type,
        userId: plan.userId,
        location: plan.location,
        url: plan.url,
        allDay: plan.allDay,
        priority: plan.priority,
        calendarId: plan.calendarId,
      }

      if (promise && typeof promise.then === 'function') {
        promise
          .then(() => {
            calendarToast.eventMoved(eventData, newStartTime, {
              undoAction: async () => {
                try {
                  const originalEndTime = new Date(previousStartTime.getTime() + durationMs)
                  await eventUpdateHandler!(dragDataRef.current!.eventId, {
                    startTime: previousStartTime,
                    endTime: originalEndTime,
                  })
                  calendarToast.success(t('calendar.event.undoMove'))
                } catch {
                  calendarToast.error(t('calendar.event.undoFailed'))
                }
              },
            })
          })
          .catch((error: unknown) => {
            console.error('Failed to update event time:', error)
            calendarToast.error(t('calendar.event.moveFailed'))
          })
      } else {
        calendarToast.eventMoved(eventData, newStartTime)
      }
    },
    [date, calendarToast, eventUpdateHandler, dragDataRef, t]
  )

  // プラン更新処理を実行する
  const executeEventUpdate = useCallback(
    async (newStartTime: Date) => {
      if (!eventUpdateHandler || !dragDataRef.current?.eventId || !dragDataRef.current?.hasMoved) {
        return
      }

      const { event, durationMs } = calculateEventDuration(events, dragDataRef.current.eventId, dragDataRef.current)

      if (!event) {
        console.warn('Plan not found for update')
        return
      }

      const newEndTime = new Date(newStartTime.getTime() + durationMs)

      if (newEndTime <= newStartTime) {
        newEndTime.setTime(newStartTime.getTime() + 60 * 60 * 1000)
      }

      try {
        console.log('🚀 プラン更新実行:', {
          eventId: dragDataRef.current.eventId,
          newStartTime: newStartTime.toISOString(),
          newEndTime: newEndTime.toISOString(),
        })

        const result = eventUpdateHandler(dragDataRef.current.eventId, {
          startTime: newStartTime,
          endTime: newEndTime,
        })

        await handleEventUpdateToast(Promise.resolve(result), event, newStartTime, durationMs)
      } catch (error) {
        console.error('Failed to update event time:', error)
        calendarToast.error(t('calendar.event.moveFailed'))
      }
    },
    [eventUpdateHandler, events, dragDataRef, handleEventUpdateToast, calendarToast, t]
  )

  return {
    handleMouseDown,
    handleDragging,
    handleEventDrop,
    handleEventClick,
    executeEventUpdate,
  }
}
