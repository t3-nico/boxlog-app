// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
import { useCallback, useEffect } from 'react'

import { useTicketMutations } from '@/features/plans/hooks/useTicketMutations'
import { logger } from '@/lib/logger'
import type { CalendarEvent } from '../types/calendar.types'

/**
 * イベント操作（CRUD）を提供するフック
 * イベントの削除、復元、更新、自動クリーンアップを管理
 */
export const useEventOperations = () => {
  const { updateTicket, deleteTicket } = useTicketMutations()

  // イベント削除ハンドラー（ソフトデリート）
  const handleEventDelete = useCallback(
    async (eventId: string) => {
      try {
        deleteTicket.mutate({ id: eventId })
        logger.log('✅ Ticket deleted:', eventId)
      } catch (error) {
        logger.error('Failed to delete ticket:', error)
      }
    },
    [deleteTicket]
  )

  // イベント復元ハンドラー
  const handleEventRestore = useCallback(async (_event: CalendarEvent) => {
    console.log('TODO: Sessions統合後に実装')
    // Ticketにはソフトデリート機能がないため、復元は未実装
  }, [])

  // イベント更新ハンドラー（ドラッグ&ドロップ用）
  const handleUpdateEvent = useCallback(
    async (eventIdOrEvent: string | CalendarEvent, updates?: { startTime: Date; endTime: Date }) => {
      try {
        // ドラッグ&ドロップからの呼び出し（eventId + updates形式）
        if (typeof eventIdOrEvent === 'string' && updates) {
          const eventId = eventIdOrEvent

          logger.log('🔧 Ticket更新 (eventId + updates形式):', {
            eventId,
            newStartTime: updates.startTime.toISOString(),
            newEndTime: updates.endTime.toISOString(),
          })

          updateTicket.mutate({
            id: eventId,
            data: {
              start_time: updates.startTime.toISOString(),
              end_time: updates.endTime.toISOString(),
            },
          })
        }
        // CalendarEventオブジェクト形式
        else if (typeof eventIdOrEvent === 'object') {
          const updatedEvent = eventIdOrEvent

          logger.log('🔧 Ticket更新 (CalendarEvent形式):', {
            eventId: updatedEvent.id,
            newStartDate: updatedEvent.startDate.toISOString(),
            newEndDate: updatedEvent.endDate?.toISOString(),
          })

          updateTicket.mutate({
            id: updatedEvent.id,
            data: {
              start_time: updatedEvent.startDate.toISOString(),
              end_time: updatedEvent.endDate?.toISOString(),
            },
          })
        }
      } catch (error) {
        logger.error('❌ Failed to update ticket:', error)
      }
    },
    [updateTicket]
  )

  // 30日経過した予定を自動削除
  useEffect(() => {
    // TODO(#621): Events削除後、Tickets/Sessions統合後に再実装
  }, [])

  return {
    handleEventDelete,
    handleEventRestore,
    handleUpdateEvent,
  }
}
