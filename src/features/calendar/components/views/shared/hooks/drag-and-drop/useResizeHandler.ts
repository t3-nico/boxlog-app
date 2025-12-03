'use client'

import type React from 'react'
import { useCallback } from 'react'

import useCalendarToast from '@/features/calendar/lib/toast'
import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { useI18n } from '@/features/i18n/lib/hooks'

import { HOUR_HEIGHT } from '@/features/calendar/components/views/shared/constants/grid.constants'

import type { DragDataRef, DragState } from './types'
import { snapToQuarterHour } from './utils'

interface UseResizeHandlerProps {
  events: CalendarPlan[]
  eventUpdateHandler:
    | ((eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void)
    | undefined
  dragDataRef: React.MutableRefObject<DragDataRef | null>
  setDragState: React.Dispatch<React.SetStateAction<DragState>>
}

export function useResizeHandler({ events, eventUpdateHandler, dragDataRef, setDragState }: UseResizeHandlerProps) {
  const { t } = useI18n()
  const calendarToast = useCalendarToast()

  // リサイズ処理
  const handleResizing = useCallback(
    (constrainedX: number, constrainedY: number, deltaY: number) => {
      const dragData = dragDataRef.current
      if (!dragData) return

      const newHeight = Math.max(15, dragData.eventDuration + deltaY)
      const { snappedTop: snappedHeight } = snapToQuarterHour(newHeight)
      const finalHeight = Math.max(HOUR_HEIGHT / 4, snappedHeight)

      const event = events.find((e) => e.id === dragData.eventId)
      let previewTime = null

      if (event?.startDate) {
        const newDurationMs = (finalHeight / HOUR_HEIGHT) * 60 * 60 * 1000
        const previewEndTime = new Date(event.startDate.getTime() + newDurationMs)
        previewTime = { start: event.startDate, end: previewEndTime }
      }

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: constrainedX, y: constrainedY },
        snappedPosition: {
          top: dragData.originalTop,
          height: finalHeight,
        },
        previewTime,
      }))
    },
    [events, dragDataRef, setDragState]
  )

  // リサイズ完了処理
  const handleResize = useCallback(
    (snappedHeight: number | undefined) => {
      if (!dragDataRef.current || !snappedHeight) {
        return
      }

      console.log('🟡 リサイズ終了:', {
        eventId: dragDataRef.current.eventId,
        newHeight: snappedHeight,
      })

      if (!eventUpdateHandler || !dragDataRef.current?.hasMoved) {
        return
      }

      const event = events.find((e) => e.id === dragDataRef.current?.eventId)
      if (!event?.startDate) {
        return
      }

      const newDurationMs = (snappedHeight / HOUR_HEIGHT) * 60 * 60 * 1000
      const newEndTime = new Date(event.startDate.getTime() + newDurationMs)

      const eventData: CalendarPlan = {
        id: event.id,
        title: event.title || t('calendar.event.title'),
        description: event.description,
        startDate: event.startDate,
        endDate: newEndTime,
        status: event.status,
        color: event.color,
        plan_number: event.plan_number,
        reminder_minutes: event.reminder_minutes,
        tags: event.tags,
        createdAt: event.createdAt,
        updatedAt: new Date(),
        displayStartDate: event.startDate,
        displayEndDate: newEndTime,
        duration: Math.round(newDurationMs / (1000 * 60)),
        isMultiDay: event.startDate.toDateString() !== newEndTime.toDateString(),
        isRecurring: false,
        type: event.type,
        userId: event.userId,
        location: event.location,
        url: event.url,
        allDay: event.allDay,
        priority: event.priority,
        calendarId: event.calendarId,
      }

      try {
        const promise = eventUpdateHandler(dragDataRef.current.eventId, {
          startTime: event.startDate,
          endTime: newEndTime,
        })

        if (promise && typeof promise.then === 'function') {
          promise
            .then(() => {
              calendarToast.eventUpdated(eventData)
            })
            .catch((error: unknown) => {
              console.error('Failed to resize event:', error)
              calendarToast.error(t('calendar.event.resizeFailed'))
            })
        } else {
          calendarToast.eventUpdated(eventData)
        }
      } catch (error) {
        console.error('Failed to resize event:', error)
        calendarToast.error(t('calendar.event.resizeFailed'))
      }
    },
    [events, eventUpdateHandler, dragDataRef, calendarToast, t]
  )

  // リサイズ開始
  const handleResizeStart = useCallback(
    (
      eventId: string,
      _direction: 'top' | 'bottom',
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number }
    ) => {
      if (e.button !== 0) return

      console.log('🟡 リサイズ開始:', { eventId, direction: _direction, originalPosition })

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
      }

      setDragState({
        isDragging: false,
        isResizing: true,
        draggedEventId: eventId,
        dragStartPosition: startPosition,
        currentPosition: startPosition,
        originalPosition,
        snappedPosition: { top: originalPosition.top, height: originalPosition.height },
        previewTime: null,
        recentlyDragged: false,
        recentlyResized: false,
        dragElement: null,
        ghostElement: null,
      })
    },
    [dragDataRef, setDragState]
  )

  return {
    handleResizing,
    handleResize,
    handleResizeStart,
  }
}
