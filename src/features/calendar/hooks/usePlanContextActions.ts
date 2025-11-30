// TODO(#621): Plans/Sessions統合後に型エラー解消
'use client'

import { useCallback } from 'react'

import useCalendarToast from '@/features/calendar/lib/toast'
import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { useI18n } from '@/features/i18n/lib/hooks'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'

export function usePlanContextActions() {
  const { t } = useI18n()
  const { openInspector } = usePlanInspectorStore()
  const calendarToast = useCalendarToast()
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

  // Toast用のプランデータを作成
  const createToastPlanData = useCallback(
    (newPlan: CalendarPlan) => {
      const duration =
        newPlan.startDate && newPlan.endDate
          ? Math.round((newPlan.endDate.getTime() - newPlan.startDate.getTime()) / (1000 * 60))
          : 60

      const isMultiDay =
        newPlan.startDate && newPlan.endDate
          ? newPlan.startDate.toDateString() !== newPlan.endDate.toDateString()
          : false

      return {
        id: newPlan.id,
        title: newPlan.title || t('calendar.plan.title'),
        displayStartDate: newPlan.startDate || new Date(),
        displayEndDate: newPlan.endDate || new Date(),
        duration,
        isMultiDay,
        isRecurring: newPlan.isRecurring || false,
      }
    },
    [t]
  )

  // 編集モーダル用のデータを作成
  const createEditModalData = useCallback(
    (newPlan: CalendarPlan) => ({
      title: newPlan.title,
      description: newPlan.description,
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      type: newPlan.type,
      status: newPlan.status,
      priority: newPlan.priority,
      color: newPlan.color,
      location: newPlan.location,
      url: newPlan.url,
      reminderMinutes: newPlan.reminder_minutes ?? null,
      tagIds: newPlan.tags?.map((tag) => tag.id) || [],
    }),
    []
  )

  const showDuplicationSuccess = useCallback(
    (_newPlan: CalendarPlan) => {
      // TODO(#621): Plans/Sessions統合後に再実装
      console.log('TODO: Sessions統合後に実装')
      // const toastPlanData = createToastPlanData(newPlan)
      // const editModalData = createEditModalData(newPlan)

      // calendarToast.planCreated(toastPlanData, {
      //   viewAction: () => {
      //     openEditModal(newPlan.id, editModalData, {
      //       source: 'duplicate',
      //       date: newPlan.startDate,
      //       viewType: 'day',
      //     })
      //   },
      // })
    },
    [calendarToast, createToastPlanData, createEditModalData]
  )

  const handleDuplicatePlan = useCallback(
    async (_plan: CalendarPlan) => {
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
    },
    [calendarToast, showDuplicationSuccess, t]
  )

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
