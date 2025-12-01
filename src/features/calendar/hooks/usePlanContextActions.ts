// TODO(#621): Plans/Sessions統合後に型エラー解消
'use client'

import { useCallback, useState } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import type { RecurringEditScope } from '@/features/plans/components/shared/RecurringEditDialog'

export function usePlanContextActions() {
  const { openInspector } = usePlanInspectorStore()
  const { deletePlan } = usePlanMutations()

  // 繰り返しプラン削除用の状態
  const [recurringDeleteTarget, setRecurringDeleteTarget] = useState<CalendarPlan | null>(null)
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false)

  const handleDeletePlan = useCallback(
    async (plan: CalendarPlan) => {
      // 繰り返しプランの場合はダイアログを表示
      if (plan.isRecurring) {
        setRecurringDeleteTarget(plan)
        setRecurringDialogOpen(true)
        return
      }

      // 通常プラン: 削除確認ダイアログ
      if (!confirm('このプランを削除しますか？')) {
        return
      }

      try {
        // プランを削除（繰り返しオカレンスの場合はcalendarIdが親ID）
        const planIdToDelete = plan.calendarId || plan.id
        await deletePlan.mutateAsync({ id: planIdToDelete })
      } catch (err) {
        console.error('Failed to delete plan:', err)
      }
    },
    [deletePlan]
  )

  // 繰り返しプラン削除確認ハンドラー
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      if (!recurringDeleteTarget) return

      try {
        // TODO: scopeに応じた削除処理を実装
        // scope: 'this' - この日のみ例外として削除（plan_instancesに追加）
        // scope: 'thisAndFuture' - この日以降を終了日として設定
        // scope: 'all' - 親プラン自体を削除
        const planIdToDelete = recurringDeleteTarget.calendarId || recurringDeleteTarget.id
        if (scope === 'all') {
          await deletePlan.mutateAsync({ id: planIdToDelete })
        } else {
          // 部分削除の場合（TODO: 例外作成APIを実装後に対応）
          console.log('Partial delete with scope:', scope, 'for plan:', recurringDeleteTarget)
          // 現時点では全削除のみ対応
          await deletePlan.mutateAsync({ id: planIdToDelete })
        }
      } catch (err) {
        console.error('Failed to delete recurring plan:', err)
      } finally {
        setRecurringDialogOpen(false)
        setRecurringDeleteTarget(null)
      }
    },
    [recurringDeleteTarget, deletePlan]
  )

  const handleRecurringDialogClose = useCallback(() => {
    setRecurringDialogOpen(false)
    setRecurringDeleteTarget(null)
  }, [])

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
    // 繰り返しプラン削除用
    recurringDialogOpen,
    recurringDeleteTarget,
    handleRecurringDeleteConfirm,
    handleRecurringDialogClose,
  }
}
