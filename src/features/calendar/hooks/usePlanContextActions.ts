// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
// TODO(#621): Events削除後の一時的な型エラー回避
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
    async (event: CalendarPlan) => {
      // 削除確認ダイアログ
      if (!confirm('このプランを削除しますか？')) {
        return
      }

      try {
        // プランを削除
        await deletePlan.mutateAsync({ id: event.id })
      } catch (err) {
        console.error('Failed to delete event:', err)
      }
    },
    [deletePlan]
  )

  const handleEditPlan = useCallback(
    (event: CalendarPlan) => {
      // planInspectorを開いて編集モードにする
      openInspector(event.id)
    },
    [openInspector]
  )

  // イベントの日付データを正規化
  const normalizeEventDates = (event: CalendarPlan) => {
    const startDate = event.startDate || new Date()
    const endDate = event.endDate || new Date()
    return { startDate, endDate }
  }

  // 複製イベントデータを作成
  const createDuplicateEventData = (event: CalendarPlan, newStartDate: Date, newEndDate: Date) => ({
    title: `${event.title} (コピー)`,
    description: event.description,
    startDate: newStartDate,
    endDate: newEndDate,
    type: event.type || 'event',
    status: event.status || 'planned',
    priority: event.priority || 'necessary',
    color: event.color,
    location: event.location,
    url: event.url,
    reminders: event.reminders || [],
    tagIds: event.tags?.map((tag) => tag.id) || [],
  })

  // Toast用のイベントデータを作成
  const createToastEventData = useCallback(
    (newEvent: CalendarPlan) => {
      const duration =
        newEvent.startDate && newEvent.endDate
          ? Math.round((newEvent.endDate.getTime() - newEvent.startDate.getTime()) / (1000 * 60))
          : 60

      const isMultiDay =
        newEvent.startDate && newEvent.endDate
          ? newEvent.startDate.toDateString() !== newEvent.endDate.toDateString()
          : false

      return {
        id: newEvent.id,
        title: newEvent.title || t('calendar.event.title'),
        displayStartDate: newEvent.startDate || new Date(),
        displayEndDate: newEvent.endDate || new Date(),
        duration,
        isMultiDay,
        isRecurring: newEvent.isRecurring || false,
      }
    },
    [t]
  )

  // 編集モーダル用のデータを作成
  const createEditModalData = useCallback(
    (newEvent: CalendarPlan) => ({
      title: newEvent.title,
      description: newEvent.description,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      type: newEvent.type,
      status: newEvent.status,
      priority: newEvent.priority,
      color: newEvent.color,
      location: newEvent.location,
      url: newEvent.url,
      reminders: newEvent.reminders,
      tagIds: newEvent.tags?.map((tag) => tag.id) || [],
    }),
    []
  )

  const logDuplicationStart = (event: CalendarPlan, startDate: Date, endDate: Date) => {
    console.log('🔍 Duplicating event:', {
      original: {
        title: event.title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
  }

  const logNewEventDates = (newStartDate: Date, newEndDate: Date) => {
    console.log('📅 New event dates:', {
      newStartDate: newStartDate.toISOString(),
      newEndDate: newEndDate.toISOString(),
    })
  }

  const logDuplicationSuccess = (newEvent: CalendarPlan) => {
    console.log('✅ Duplicated event created:', {
      id: newEvent.id,
      title: newEvent.title,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
    })
  }

  const showDuplicationSuccess = useCallback(
    (_newEvent: CalendarPlan) => {
      // TODO(#621): Events削除後、plans/Sessions統合後に再実装
      console.log('TODO: Sessions統合後に実装')
      // const toastEventData = createToastEventData(newEvent)
      // const editModalData = createEditModalData(newEvent)

      // calendarToast.eventCreated(toastEventData, {
      //   viewAction: () => {
      //     openEditModal(newEvent.id, editModalData, {
      //       source: 'duplicate',
      //       date: newEvent.startDate,
      //       viewType: 'day',
      //     })
      //   },
      // })
    },
    [calendarToast, createToastEventData, createEditModalData]
  )

  const handleDuplicatePlan = useCallback(
    async (_event: CalendarPlan) => {
      // TODO(#621): Events削除後、plans/Sessions統合後に再実装
      console.log('TODO: Sessions統合後に実装')
      // try {
      //   const { startDate, endDate } = normalizeEventDates(event)
      //   logDuplicationStart(event, startDate, endDate)
      //
      //   const newStartDate = new Date(startDate)
      //   const newEndDate = new Date(endDate)
      //   logNewEventDates(newStartDate, newEndDate)
      //
      //   const duplicateData = createDuplicateEventData(event, newStartDate, newEndDate)
      //   const newEvent = await createEvent(duplicateData)
      //   logDuplicationSuccess(newEvent)
      //
      //   showDuplicationSuccess(newEvent)
      // } catch (err) {
      //   console.error('❌ Failed to duplicate event:', err)
      //   calendarToast.error(t('calendar.event.duplicateFailed'))
      // }
    },
    [calendarToast, showDuplicationSuccess, t]
  )

  const handleViewDetails = useCallback(
    (event: CalendarPlan) => {
      // planInspectorを開いて詳細を表示
      openInspector(event.id)
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
