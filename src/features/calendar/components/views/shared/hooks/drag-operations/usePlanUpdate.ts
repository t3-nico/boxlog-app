/**
 * イベント更新処理の専用フック
 */

'use client'

import { useCallback } from 'react'

import useCalendarToast from '@/features/calendar/lib/toast'
import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { useI18n } from '@/features/i18n/lib/hooks'

import { HOUR_HEIGHT } from '../../constants/grid.constants'

interface UseEventUpdateProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  events: CalendarPlan[]
  date: Date
}

export function useEventUpdate({ onEventUpdate, events, date }: UseEventUpdateProps) {
  const { t } = useI18n()
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
    (plan: CalendarPlan, newStartTime: Date, durationMs: number): CalendarPlan => ({
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
      duration: Math.round(durationMs / (1000 * 60)), // 分単位
      isMultiDay: false,
      isRecurring: false,
      type: plan.type,
      userId: plan.userId,
      location: plan.location,
      url: plan.url,
      allDay: plan.allDay,
      priority: plan.priority,
      calendarId: plan.calendarId,
    }),
    [t]
  )

  const handleEventUpdateToast = useCallback(
    async (
      promise: Promise<void> | void,
      plan: CalendarPlan,
      newStartTime: Date,
      durationMs: number,
      previousStartTime: Date
    ) => {
      if (!plan) return

      // 時間が実際に変更されたかチェック
      const timeChanged = Math.abs(newStartTime.getTime() - previousStartTime.getTime()) > 1000

      if (!timeChanged) {
        console.log('🔧 時間変更なし - Toast表示をスキップ')
        return
      }

      const eventData = createEventData(plan, newStartTime, durationMs)

      // Promiseが返される場合
      if (promise && typeof promise === 'object' && 'then' in promise) {
        promise
          .then(() => {
            calendarToast.eventMoved(eventData, newStartTime, {
              undoAction: async () => {
                try {
                  const originalEndTime = new Date(previousStartTime.getTime() + durationMs)
                  await onEventUpdate?.(plan.id, {
                    startTime: previousStartTime,
                    endTime: originalEndTime,
                  })
                  calendarToast.success(t('calendar.event.undoMove'))
                } catch (error) {
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
        // 同期的な場合
        calendarToast.eventMoved(eventData, newStartTime)
      }
    },
    [calendarToast, onEventUpdate, createEventData, t]
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
        calendarToast.error(t('calendar.event.moveFailed'))
      }
    },
    [onEventUpdate, calculateEventDuration, handleEventUpdateToast, date, calendarToast, t]
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
    [onEventUpdate, events, calendarToast, createEventData, t]
  )

  return {
    executeEventUpdate,
    executeEventResize,
    calculateEventDuration,
  }
}
