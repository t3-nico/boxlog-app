// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
// TODO(#621): Events削除後の一時的な型エラー回避
'use client'

import { useCallback } from 'react'

import useCalendarToast from '@/features/calendar/lib/toast'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'

export function useEventContextActions() {
  const { t } = useI18n()
  const { openInspector } = useTicketInspectorStore()
  const calendarToast = useCalendarToast()

  const handleDeleteEvent = useCallback(
    async (_event: CalendarEvent) => {
      // TODO(#621): Events削除後、Tickets/Sessions統合後に再実装
      console.log('TODO: Sessions統合後に実装')
      // try {
      //   // イベントのバックアップを作成
      //   const _eventBackup = { ...event }

      //   // EventStoreのsoftDeleteEventが既にTrashStoreとの統合を行っている
      //   await softDeleteEvent(event.id)

      //   // Calendar Toast用のイベントデータを作成
      //   const eventData = {
      //     id: event.id,
      //     title: event.title || t('calendar.event.title'),
      //     displayStartDate: event.displayStartDate || event.startDate || new Date(),
      //     displayEndDate: event.displayEndDate || event.endDate || new Date(),
      //     duration: event.duration || 60,
      //     isMultiDay: event.isMultiDay || false,
      //     isRecurring: event.isRecurring || false,
      //   }

      //   // Calendar Toast で削除通知（アンドゥ付き）
      //   calendarToast.eventDeleted(eventData, async () => {
      //     try {
      //       // アンドゥ処理（復元）
      //       // Note: 実際の復元機能が必要な場合は restoreEvent などの実装が必要
      //       calendarToast.success(t('calendar.event.restore'))
      //     } catch (error) {
      //       calendarToast.error(t('calendar.event.restoreFailed'))
      //     }
      //   })
      // } catch (err) {
      //   console.error('Failed to delete event:', err)
      //   calendarToast.error(t('calendar.event.deleteFailed'))
      // }
    },
    [calendarToast, t]
  )

  const handleEditEvent = useCallback(
    (event: CalendarEvent) => {
      // TicketInspectorを開いて編集モードにする
      openInspector(event.id)
    },
    [openInspector]
  )

  // イベントの日付データを正規化
  const normalizeEventDates = (event: CalendarEvent) => {
    const startDate = event.startDate || new Date()
    const endDate = event.endDate || new Date()
    return { startDate, endDate }
  }

  // 複製イベントデータを作成
  const createDuplicateEventData = (event: CalendarEvent, newStartDate: Date, newEndDate: Date) => ({
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
    (newEvent: CalendarEvent) => {
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
    (newEvent: CalendarEvent) => ({
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

  const logDuplicationStart = (event: CalendarEvent, startDate: Date, endDate: Date) => {
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

  const logDuplicationSuccess = (newEvent: CalendarEvent) => {
    console.log('✅ Duplicated event created:', {
      id: newEvent.id,
      title: newEvent.title,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
    })
  }

  const showDuplicationSuccess = useCallback(
    (_newEvent: CalendarEvent) => {
      // TODO(#621): Events削除後、Tickets/Sessions統合後に再実装
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

  const handleDuplicateEvent = useCallback(
    async (_event: CalendarEvent) => {
      // TODO(#621): Events削除後、Tickets/Sessions統合後に再実装
      console.log('TODO: Sessions統合後に実装')
      // try {
      //   const { startDate, endDate } = normalizeEventDates(event)
      //   logDuplicationStart(event, startDate, endDate)

      //   const newStartDate = new Date(startDate)
      //   const newEndDate = new Date(endDate)
      //   logNewEventDates(newStartDate, newEndDate)

      //   const duplicateData = createDuplicateEventData(event, newStartDate, newEndDate)
      //   const newEvent = await createEvent(duplicateData)
      //   logDuplicationSuccess(newEvent)

      //   showDuplicationSuccess(newEvent)
      // } catch (err) {
      //   console.error('❌ Failed to duplicate event:', err)
      //   calendarToast.error(t('calendar.event.duplicateFailed'))
      // }
    },
    [calendarToast, showDuplicationSuccess, t]
  )

  const handleViewDetails = useCallback(
    (event: CalendarEvent) => {
      // TicketInspectorを開いて詳細を表示
      openInspector(event.id)
    },
    [openInspector]
  )

  return {
    handleDeleteEvent,
    handleEditEvent,
    handleDuplicateEvent,
    handleViewDetails,
  }
}
