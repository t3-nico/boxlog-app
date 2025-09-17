/**
 * イベント更新処理の専用フック
 */

'use client'

import { useCallback } from 'react'

import useCalendarToast from '@/features/calendar/lib/toast'

import { HOUR_HEIGHT } from '../../constants/grid.constants'

interface CalendarEvent {
  id: string
  title: string
  startDate?: Date
  endDate?: Date
  [key: string]: unknown
}

interface UseEventUpdateProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  events: CalendarEvent[]
  date: Date
}

export function useEventUpdate({ onEventUpdate, events, date }: UseEventUpdateProps) {
  const calendarToast = useCalendarToast()

  const calculateEventDuration = useCallback(
    (eventId: string, eventDuration?: number) => {
      const event = events.find((e) => e.id === eventId)
      let durationMs = 60 * 60 * 1000 // デフォルト1時間

      if (event?.startDate && event?.endDate) {
        durationMs = event.endDate.getTime() - event.startDate.getTime()
      } else if (eventDuration) {
        durationMs = (eventDuration / HOUR_HEIGHT) * 60 * 60 * 1000
      }

      return { event, durationMs }
    },
    [events]
  )

  const createEventData = useCallback(
    (event: CalendarEvent, newStartTime: Date, durationMs: number) => ({
      id: event.id,
      title: event.title || 'イベント',
      displayStartDate: newStartTime,
      displayEndDate: new Date(newStartTime.getTime() + durationMs),
      duration: Math.round(durationMs / (1000 * 60)), // 分単位
      isMultiDay: false,
      isRecurring: false,
    }),
    []
  )

  const handleEventUpdateToast = useCallback(
    async (
      promise: Promise<void> | void,
      event: CalendarEvent,
      newStartTime: Date,
      durationMs: number,
      previousStartTime: Date
    ) => {
      if (!event) return

      // 時間が実際に変更されたかチェック
      const timeChanged = Math.abs(newStartTime.getTime() - previousStartTime.getTime()) > 1000

      if (!timeChanged) {
        console.log('🔧 時間変更なし - Toast表示をスキップ')
        return
      }

      const eventData = createEventData(event, newStartTime, durationMs)

      // Promiseが返される場合
      if (promise && typeof promise === 'object' && 'then' in promise) {
        promise
          .then(() => {
            calendarToast.eventMoved(eventData, newStartTime, {
              undoAction: async () => {
                try {
                  const originalEndTime = new Date(previousStartTime.getTime() + durationMs)
                  await onEventUpdate?.(event.id, {
                    startTime: previousStartTime,
                    endTime: originalEndTime,
                  })
                  calendarToast.success('移動を取り消しました')
                } catch (error) {
                  calendarToast.error('取り消しに失敗しました')
                }
              },
            })
          })
          .catch((error: unknown) => {
            console.error('Failed to update event time:', error)
            calendarToast.error('予定の移動に失敗しました')
          })
      } else {
        // 同期的な場合
        calendarToast.eventMoved(eventData, newStartTime)
      }
    },
    [calendarToast, onEventUpdate, createEventData]
  )

  const executeEventUpdate = useCallback(
    async (eventId: string, newStartTime: Date, eventDuration?: number, hasMoved = false) => {
      if (!onEventUpdate || !hasMoved) return

      const { event, durationMs } = calculateEventDuration(eventId, eventDuration)
      if (!event) return

      const newEndTime = new Date(newStartTime.getTime() + durationMs)

      // エッジケース: 終了時刻が開始時刻より前の場合は修正
      if (newEndTime <= newStartTime) {
        newEndTime.setTime(newStartTime.getTime() + 60 * 60 * 1000) // 最低1時間
      }

      try {
        console.log('🚀 イベント更新実行:', {
          eventId,
          newStartTime: newStartTime.toISOString(),
          newEndTime: newEndTime.toISOString(),
        })

        const promise = onEventUpdate(eventId, {
          startTime: newStartTime,
          endTime: newEndTime,
        })

        const previousStartTime = event.startDate || date
        await handleEventUpdateToast(promise, event, newStartTime, durationMs, previousStartTime)
      } catch (error) {
        console.error('Failed to update event time:', error)
        calendarToast.error('予定の移動に失敗しました')
      }
    },
    [onEventUpdate, calculateEventDuration, handleEventUpdateToast, date, calendarToast]
  )

  const executeEventResize = useCallback(
    async (eventId: string, newHeight: number, hasMoved = false) => {
      if (!onEventUpdate || !hasMoved) return

      const event = events.find((e) => e.id === eventId)
      if (!event?.startDate) return

      const newDurationMs = (newHeight / HOUR_HEIGHT) * 60 * 60 * 1000
      const newEndTime = new Date(event.startDate.getTime() + newDurationMs)

      const eventData = createEventData(event, event.startDate, newDurationMs)

      try {
        const promise = onEventUpdate(eventId, {
          startTime: event.startDate,
          endTime: newEndTime,
        })

        if (promise && typeof promise === 'object' && 'then' in promise) {
          promise
            .then(() => {
              calendarToast.eventUpdated(eventData)
            })
            .catch((error: unknown) => {
              console.error('Failed to resize event:', error)
              calendarToast.error('予定のリサイズに失敗しました')
            })
        } else {
          calendarToast.eventUpdated(eventData)
        }
      } catch (error) {
        console.error('Failed to resize event:', error)
        calendarToast.error('予定のリサイズに失敗しました')
      }
    },
    [onEventUpdate, events, calendarToast, createEventData]
  )

  return {
    executeEventUpdate,
    executeEventResize,
    calculateEventDuration,
  }
}
