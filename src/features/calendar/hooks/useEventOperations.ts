// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
import { useCallback, useEffect } from 'react'

// import type { UpdateEventRequest } from '@/features/calendar/types/calendar.types'
// import { useEventStore } from '@/features/calendar/types/calendar.types'

import type { CalendarEvent } from '../types/calendar.types'

/**
 * イベント操作（CRUD）を提供するフック
 * イベントの削除、復元、更新、自動クリーンアップを管理
 * TODO(#621): Events削除後、Tickets/Sessions統合後に再実装
 */
export const useEventOperations = () => {
  // TODO(#621): Events削除後、Tickets/Sessions統合後に再実装
  // const eventStore = useEventStore()
  // const { events } = eventStore

  // イベント削除ハンドラー（ソフトデリート）
  const handleEventDelete = useCallback(async (_eventId: string) => {
    console.log('TODO: Sessions統合後に実装')
    // try {
    //   const eventToDelete = eventStore.events.find((e) => e.id === eventId)
    //   if (eventToDelete) {
    //     await eventStore.softDeleteEvent(eventId)
    //   }
    // } catch (error) {
    //   logger.error('Failed to delete event:', error)
    // }
  }, [])

  // イベント復元ハンドラー
  const handleEventRestore = useCallback(async (_event: CalendarEvent) => {
    console.log('TODO: Sessions統合後に実装')
    // try {
    //   await eventStore.restoreEvent(event.id)
    //   logger.log('✅ Event restored:', event.id, event.title)
    // } catch (error) {
    //   logger.error('Failed to restore event:', error)
    // }
  }, [])

  // イベント更新ハンドラー（ドラッグ&ドロップ用）
  const handleUpdateEvent = useCallback(
    async (_eventIdOrEvent: string | CalendarEvent, _updates?: { startTime: Date; endTime: Date }) => {
      console.log('TODO: Sessions統合後に実装')
      // try {
      //   // ドラッグ&ドロップからの呼び出し（eventId + updates形式）
      //   if (typeof eventIdOrEvent === 'string' && updates) {
      //     const eventId = eventIdOrEvent
      //     const event = events.find((e) => e.id === eventId)
      //     if (!event) {
      //       logger.error('❌ Event not found for update:', eventId)
      //       return
      //     }

      //     logger.log('🔧 イベント更新:', {
      //       eventId,
      //       oldStartDate: event.startDate?.toISOString?.(),
      //       newStartTime: updates.startTime.toISOString(),
      //       newEndTime: updates.endTime.toISOString(),
      //     })

      //     const updateRequest: UpdateEventRequest = {
      //       id: eventId,
      //       title: event.title,
      //       startDate: updates.startTime,
      //       endDate: updates.endTime,
      //       location: event.location,
      //       description: event.description,
      //       color: event.color,
      //     }

      //     await eventStore.updateEvent(updateRequest)
      //   }
      //   // 従来の呼び出し（CalendarEventオブジェクト形式）
      //   else if (typeof eventIdOrEvent === 'object') {
      //     const updatedEvent = eventIdOrEvent
      //     const updateRequest: UpdateEventRequest = {
      //       id: updatedEvent.id,
      //       title: updatedEvent.title,
      //       startDate: updatedEvent.startDate,
      //       endDate: updatedEvent.endDate,
      //       location: updatedEvent.location,
      //       description: updatedEvent.description,
      //       color: updatedEvent.color,
      //     }

      //     await eventStore.updateEvent(updateRequest)
      //   }
      // } catch (error) {
      //   logger.error('❌ Failed to update event:', error)
      // }
    },
    []
  )

  // 30日経過した予定を自動削除
  useEffect(() => {
    // TODO(#621): Events削除後、Tickets/Sessions統合後に再実装
    // const checkAndCleanup = async () => {
    //   try {
    //     await eventStore.clearTrash()
    //     logger.log('✅ Old trash cleaned up automatically')
    //   } catch (error) {
    //     logger.error('❌ Failed to clean up old trash:', error)
    //   }
    // }
    // // 1日1回チェック
    // const interval = setInterval(checkAndCleanup, 24 * 60 * 60 * 1000)
    // checkAndCleanup() // 初回実行
    // return () => clearInterval(interval)
  }, [])

  return {
    handleEventDelete,
    handleEventRestore,
    handleUpdateEvent,
  }
}
