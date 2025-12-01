// TODO(#621): Plans/Sessions統合後に型エラー解消
'use client'

import { useCallback } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'

export function usePlanContextActions() {
  const { openInspector } = usePlanInspectorStore()
  const { deletePlan } = usePlanMutations()

  const handleDeletePlan = useCallback(
    async (plan: CalendarPlan) => {
      // 削除確認ダイアログ
      if (!confirm('このプランを削除しますか？')) {
        return
      }

      try {
        // プランを削除
        await deletePlan.mutateAsync({ id: plan.id })
      } catch (err) {
        console.error('Failed to delete plan:', err)
      }
    },
    [deletePlan]
  )

  const handleEditPlan = useCallback(
    (plan: CalendarPlan) => {
      // planInspectorを開いて編集モードにする
      openInspector(plan.id)
    },
    [openInspector]
  )

  const handleDuplicatePlan = useCallback(async (_plan: CalendarPlan) => {
    // TODO(#621): Plans/Sessions統合後に再実装
    console.log('TODO: Sessions統合後に実装')
    // try {
    //   const { startDate, endDate } = normalizePlanDates(plan)
    //   logDuplicationStart(plan, startDate, endDate)
    //
    //   const newStartDate = new Date(startDate)
    //   const newEndDate = new Date(endDate)
    //   logNewPlanDates(newStartDate, newEndDate)
    //
    //   const duplicateData = createDuplicatePlanData(plan, newStartDate, newEndDate)
    //   const newPlan = await createPlan(duplicateData)
    //   logDuplicationSuccess(newPlan)
    //
    //   showDuplicationSuccess(newPlan)
    // } catch (err) {
    //   console.error('❌ Failed to duplicate plan:', err)
    //   calendarToast.error(t('calendar.plan.duplicateFailed'))
    // }
  }, [])

  const handleViewDetails = useCallback(
    (plan: CalendarPlan) => {
      // planInspectorを開いて詳細を表示
      openInspector(plan.id)
    },
    [openInspector]
  )

  return {
    handleDeletePlan,
    handleEditPlan,
    handleDuplicatePlan,
    handleViewDetails,
  }
}
