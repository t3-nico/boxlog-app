import { useCallback, useEffect } from 'react'

import type { UpdateEventRequest } from '@/features/events'
import { useEventStore } from '@/features/events'
import { logger } from '@/lib/logger'

import type { CalendarEvent } from '../types/calendar.types'

/**
 * イベント操作（CRUD）を提供するフック
 * イベントの削除、復元、更新、自動クリーンアップを管理
 */
export const useEventOperations = () => {
  const eventStore = useEventStore()
  const { events } = eventStore

  // イベント削除ハンドラー（ソフトデリート）
  const handleEventDelete = useCallback(
    async (eventId: string) => {
      try {
        const eventToDelete = eventStore.events.find((e) => e.id === eventId)
        if (eventToDelete) {
          await eventStore.softDeleteEvent(eventId)
        }
      } catch (error) {
        logger.error('Failed to delete event:', error)
      }
    },
    [eventStore]
  )

  // イベント復元ハンドラー
  const handleEventRestore = useCallback(
    async (event: CalendarEvent) => {
      try {
        await eventStore.restoreEvent(event.id)
        logger.log('✅ Event restored:', event.id, event.title)
      } catch (error) {
        logger.error('Failed to restore event:', error)
      }
    },
    [eventStore]
  )

  // イベント更新ハンドラー（ドラッグ&ドロップ用）
  const handleUpdateEvent = useCallback(
    async (eventIdOrEvent: string | CalendarEvent, updates?: { startTime: Date; endTime: Date }) => {
      try {
        // ドラッグ&ドロップからの呼び出し（eventId + updates形式）
        if (typeof eventIdOrEvent === 'string' && updates) {
          const eventId = eventIdOrEvent
          const event = events.find((e) => e.id === eventId)
          if (!event) {
            logger.error('❌ Event not found for update:', eventId)
            return
          }

          logger.log('🔧 イベント更新:', {
            eventId,
            oldStartDate: event.startDate?.toISOString?.(),
            newStartTime: updates.startTime.toISOString(),
            newEndTime: updates.endTime.toISOString(),
          })

          const updateRequest: UpdateEventRequest = {
            id: eventId,
            title: event.title,
            startDate: updates.startTime,
            endDate: updates.endTime,
            location: event.location,
            description: event.description,
            color: event.color,
          }

          await eventStore.updateEvent(updateRequest)
        }
        // 従来の呼び出し（CalendarEventオブジェクト形式）
        else if (typeof eventIdOrEvent === 'object') {
          const updatedEvent = eventIdOrEvent
          const updateRequest: UpdateEventRequest = {
            id: updatedEvent.id,
            title: updatedEvent.title,
            startDate: updatedEvent.startDate,
            endDate: updatedEvent.endDate,
            location: updatedEvent.location,
            description: updatedEvent.description,
            color: updatedEvent.color,
          }

          await eventStore.updateEvent(updateRequest)
        }
      } catch (error) {
        logger.error('❌ Failed to update event:', error)
      }
    },
    [eventStore, events]
  )

  // 30日経過した予定を自動削除
  useEffect(() => {
    const checkAndCleanup = async () => {
      try {
        await eventStore.clearTrash()
        logger.log('✅ Old trash cleaned up automatically')
      } catch (error) {
        logger.error('❌ Failed to clean up old trash:', error)
      }
    }

    // 1日1回チェック
    const interval = setInterval(checkAndCleanup, 24 * 60 * 60 * 1000)
    checkAndCleanup() // 初回実行

    return () => clearInterval(interval)
  }, [eventStore])

  return {
    handleEventDelete,
    handleEventRestore,
    handleUpdateEvent,
  }
}
