// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
import { useCallback, useEffect } from 'react'

import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { logger } from '@/lib/logger'
import type { CalendarPlan } from '../types/calendar.types'

/**
 * イベント操作（CRUD）を提供するフック
 * イベントの削除、復元、更新、自動クリーンアップを管理
 */
export const useEventOperations = () => {
  const { updatePlan, deletePlan } = usePlanMutations()

  // イベント削除ハンドラー（ソフトデリート）
  const handleEventDelete = useCallback(
    async (eventId: string) => {
      try {
        deletePlan.mutate({ id: eventId })
        logger.log('✅ plan deleted:', eventId)
      } catch (error) {
        logger.error('Failed to delete plan:', error)
      }
    },
    [deletePlan]
  )

  // イベント復元ハンドラー
  const handleEventRestore = useCallback(async (_plan: CalendarPlan) => {
    console.log('TODO: Sessions統合後に実装')
    // planにはソフトデリート機能がないため、復元は未実装
  }, [])

  // イベント更新ハンドラー（ドラッグ&ドロップ用）
  const handleUpdateEvent = useCallback(
    async (eventIdOrEvent: string | CalendarPlan, updates?: { startTime: Date; endTime: Date }) => {
      try {
        // ドラッグ&ドロップからの呼び出し（eventId + updates形式）
        if (typeof eventIdOrEvent === 'string' && updates) {
          const eventId = eventIdOrEvent

          logger.log('🔧 plan更新 (eventId + updates形式):', {
            eventId,
            newStartTime: updates.startTime.toISOString(),
            newEndTime: updates.endTime.toISOString(),
          })

          updatePlan.mutate({
            id: eventId,
            data: {
              start_time: updates.startTime.toISOString(),
              end_time: updates.endTime.toISOString(),
            },
          })
        }
        // CalendarPlanオブジェクト形式
        else if (typeof eventIdOrEvent === 'object') {
          const updatedEvent = eventIdOrEvent

          logger.log('🔧 plan更新 (CalendarPlan形式):', {
            eventId: updatedEvent.id,
            newStartDate: updatedEvent.startDate.toISOString(),
            newEndDate: updatedEvent.endDate?.toISOString(),
          })

          updatePlan.mutate({
            id: updatedEvent.id,
            data: {
              start_time: updatedEvent.startDate.toISOString(),
              end_time: updatedEvent.endDate?.toISOString(),
            },
          })
        }
      } catch (error) {
        logger.error('❌ Failed to update plan:', error)
      }
    },
    [updatePlan]
  )

  // 30日経過した予定を自動削除
  useEffect(() => {
    // TODO(#621): Events削除後、plans/Sessions統合後に再実装
  }, [])

  return {
    handleEventDelete,
    handleEventRestore,
    handleUpdateEvent,
  }
}
