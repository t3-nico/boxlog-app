import { useCallback, useEffect } from 'react'

import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { logger } from '@/lib/logger'
import type { CalendarPlan } from '../types/calendar.types'

/**
 * プラン操作（CRUD）を提供するフック
 * プランの削除、復元、更新、自動クリーンアップを管理
 */
export const usePlanOperations = () => {
  const { updatePlan, deletePlan } = usePlanMutations()

  // プラン削除ハンドラー（ソフトデリート）
  const handlePlanDelete = useCallback(
    async (planId: string) => {
      try {
        deletePlan.mutate({ id: planId })
        console.log('✅ プラン削除:', planId)
      } catch (error) {
        console.error('プラン削除に失敗:', error)
      }
    },
    [deletePlan]
  )

  // プラン復元ハンドラー
  const handlePlanRestore = useCallback(async (_plan: CalendarPlan) => {
    console.log('TODO: Plans統合後に実装')
    // planにはソフトデリート機能がないため、復元は未実装
  }, [])

  // プラン更新ハンドラー（ドラッグ&ドロップ用）
  const handleUpdatePlan = useCallback(
    async (planIdOrPlan: string | CalendarPlan, updates?: { startTime: Date; endTime: Date }) => {
      try {
        // ドラッグ&ドロップからの呼び出し（planId + updates形式）
        if (typeof planIdOrPlan === 'string' && updates) {
          const planId = planIdOrPlan

          console.log('🔧 プラン更新 (planId + updates形式):', {
            planId,
            newStartTime: updates.startTime.toISOString(),
            newEndTime: updates.endTime.toISOString(),
          })

          updatePlan.mutate({
            id: planId,
            data: {
              start_time: updates.startTime.toISOString(),
              end_time: updates.endTime.toISOString(),
            },
          })
        }
        // CalendarPlanオブジェクト形式
        else if (typeof planIdOrPlan === 'object') {
          const updatedPlan = planIdOrPlan

          // startDateがnullの場合は早期リターン
          if (!updatedPlan.startDate) {
            logger.error('❌ startDateがnullのため更新できません:', updatedPlan.id)
            return
          }

          logger.log('🔧 プラン更新 (CalendarPlan形式):', {
            planId: updatedPlan.id,
            newStartDate: updatedPlan.startDate.toISOString(),
            newEndDate: updatedPlan.endDate?.toISOString(),
          })

          updatePlan.mutate({
            id: updatedPlan.id,
            data: {
              start_time: updatedPlan.startDate.toISOString(),
              end_time: updatedPlan.endDate?.toISOString(),
            },
          })
        }
      } catch (error) {
        console.error('❌ プラン更新に失敗:', error)
      }
    },
    [updatePlan]
  )

  // 30日経過したプランを自動削除
  useEffect(() => {
    // TODO(#621): Events削除後、plans/Plans統合後に再実装
  }, [])

  return {
    handlePlanDelete,
    handlePlanRestore,
    handleUpdatePlan,
  }
}
