// TODO(#621): Plans/Sessions統合後に型エラー解消
'use client'

import { useCallback, useState } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import type { RecurringEditScope } from '@/features/plans/components/shared/RecurringEditDialog'
import { usePlanInstanceMutations } from '@/features/plans/hooks/usePlanInstances'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { usePlanTags } from '@/features/plans/hooks/usePlanTags'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { format } from 'date-fns'

export function usePlanContextActions() {
  const { openInspector } = usePlanInspectorStore()
  const { createPlan, deletePlan, updatePlan } = usePlanMutations()
  const { createInstance } = usePlanInstanceMutations()
  const { addPlanTag } = usePlanTags()

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
        // 親プランID（展開されたオカレンスの場合はcalendarIdが親ID）
        const parentPlanId = recurringDeleteTarget.calendarId || recurringDeleteTarget.id

        // インスタンスの日付を取得（展開されたオカレンスのIDから抽出）
        // ID形式: {parentPlanId}_{YYYY-MM-DD}
        const instanceDate = recurringDeleteTarget.id.includes('_')
          ? (recurringDeleteTarget.id.split('_').pop() ?? '')
          : (recurringDeleteTarget.startDate?.toISOString().slice(0, 10) ?? '')

        switch (scope) {
          case 'this':
            // この日のみ例外として削除（cancelled例外を作成）
            await createInstance.mutateAsync({
              planId: parentPlanId,
              instanceDate,
              exceptionType: 'cancelled',
            })
            break

          case 'thisAndFuture':
            // この日以降を終了: 親プランの recurrence_end_date を更新
            // 前日を終了日にする（この日は含めない）
            const endDate = new Date(instanceDate)
            endDate.setDate(endDate.getDate() - 1)
            await updatePlan.mutateAsync({
              id: parentPlanId,
              data: {
                recurrence_end_date: endDate.toISOString().slice(0, 10),
              },
            })
            break

          case 'all':
            // 親プラン自体を削除
            await deletePlan.mutateAsync({ id: parentPlanId })
            break
        }
      } catch (err) {
        console.error('Failed to delete recurring plan:', err)
      } finally {
        setRecurringDialogOpen(false)
        setRecurringDeleteTarget(null)
      }
    },
    [recurringDeleteTarget, deletePlan, createInstance, updatePlan]
  )

  const handleRecurringDialogClose = useCallback(() => {
    setRecurringDialogOpen(false)
    setRecurringDeleteTarget(null)
  }, [])

  const handleEditPlan = useCallback(
    (plan: CalendarPlan) => {
      // planInspectorを開いて編集モードにする
      // 繰り返しプランの場合はインスタンス日付を渡す
      const instanceDateRaw =
        plan.isRecurring && plan.id.includes('_')
          ? plan.id.split('_').pop()
          : plan.startDate?.toISOString().slice(0, 10)
      // instanceDateがundefinedの場合は渡さない
      openInspector(plan.calendarId || plan.id, instanceDateRaw ? { instanceDate: instanceDateRaw } : undefined)
    },
    [openInspector]
  )

  const handleDuplicatePlan = useCallback(
    async (plan: CalendarPlan) => {
      try {
        // 日付をフォーマット
        const dueDate = plan.startDate ? format(plan.startDate, 'yyyy-MM-dd') : undefined
        const startTime = plan.startDate ? plan.startDate.toISOString() : undefined
        const endTime = plan.endDate ? plan.endDate.toISOString() : undefined

        // プランを複製（タイトルに「のコピー」を追加）
        // 繰り返しプランの場合は、その日のインスタンスを単発プランとして複製
        const newPlan = await createPlan.mutateAsync({
          title: `${plan.title}のコピー`,
          description: plan.description ?? undefined,
          status: 'backlog', // 複製時はbacklogにリセット
          due_date: dueDate,
          start_time: startTime,
          end_time: endTime,
          reminder_minutes: plan.reminder_minutes ?? undefined,
          // 繰り返し設定はコピーしない（単発プランとして複製）
        })

        // タグも複製
        if (plan.tags && plan.tags.length > 0) {
          for (const tag of plan.tags) {
            await addPlanTag(newPlan.id, tag.id)
          }
        }

        // 複製したプランをInspectorで開く
        openInspector(newPlan.id)
      } catch (err) {
        console.error('Failed to duplicate plan:', err)
      }
    },
    [createPlan, addPlanTag, openInspector]
  )

  const handleViewDetails = useCallback(
    (plan: CalendarPlan) => {
      // planInspectorを開いて詳細を表示
      // 繰り返しプランの場合はインスタンス日付を渡す
      const instanceDateRaw =
        plan.isRecurring && plan.id.includes('_')
          ? plan.id.split('_').pop()
          : plan.startDate?.toISOString().slice(0, 10)
      // instanceDateがundefinedの場合は渡さない
      openInspector(plan.calendarId || plan.id, instanceDateRaw ? { instanceDate: instanceDateRaw } : undefined)
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
