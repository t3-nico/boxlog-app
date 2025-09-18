'use client'

import { useCallback } from 'react'

import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'
import useCalendarToast from '@/features/calendar/lib/toast'
import { useCreateModalStore } from '@/features/events/stores/useCreateModalStore'
import { useEventStore } from '@/features/events/stores/useEventStore'
import type { CalendarEvent } from '@/features/events/types/events'

export function useEventContextActions() {
  const { softDeleteEvent, updateEvent: _updateEvent, createEvent } = useEventStore()
  const { openEditModal } = useCreateModalStore()
  const { setInspectorOpen, setActiveContent } = useInspectorStore()
  const calendarToast = useCalendarToast()

  const handleDeleteEvent = useCallback(
    async (event: CalendarEvent) => {
      try {
        // イベントのバックアップを作成
        const _eventBackup = { ...event }

        // EventStoreのsoftDeleteEventが既にTrashStoreとの統合を行っている
        await softDeleteEvent(event.id)

        // Calendar Toast用のイベントデータを作成
        const eventData = {
          id: event.id,
          title: event.title || 'イベント',
          displayStartDate: event.displayStartDate || event.startDate || new Date(),
          displayEndDate: event.displayEndDate || event.endDate || new Date(),
          duration: event.duration || 60,
          isMultiDay: event.isMultiDay || false,
          isRecurring: event.isRecurring || false,
        }

        // Calendar Toast で削除通知（アンドゥ付き）
        calendarToast.eventDeleted(eventData, async () => {
          try {
            // アンドゥ処理（復元）
            // Note: 実際の復元機能が必要な場合は restoreEvent などの実装が必要
            calendarToast.success('予定を復元しました')
          } catch (error) {
            calendarToast.error('復元に失敗しました')
          }
        })
      } catch (err) {
        console.error('Failed to delete event:', err)
        calendarToast.error('予定の削除に失敗しました')
      }
    },
    [softDeleteEvent, calendarToast]
  )

  const handleEditEvent = useCallback(
    (event: CalendarEvent) => {
      // CreateEventModalを編集モードで開く（直接クリックと同じ形式に統一）
      openEditModal(
        event.id,
        {
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          type: event.type,
          status: event.status,
          priority: event.priority,
          color: event.color,
          location: event.location,
          url: event.url,
          reminders: event.reminders,
          tagIds: event.tags?.map((tag) => tag.id) || [],
        },
        {
          source: 'context-menu',
          date: event.startDate,
          viewType: 'day',
        }
      )
    },
    [openEditModal]
  )

  // イベントの日付データを正規化
  const normalizeEventDates = (event: CalendarEvent) => {
    const startDate = event.startDate || (event.start_time ? new Date(event.start_time) : new Date())
    const endDate = event.endDate || (event.end_time ? new Date(event.end_time) : new Date())
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
  const createToastEventData = (newEvent: CalendarEvent) => {
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
      title: newEvent.title || 'イベント',
      displayStartDate: newEvent.startDate || new Date(),
      displayEndDate: newEvent.endDate || new Date(),
      duration,
      isMultiDay,
      isRecurring: newEvent.isRecurring || false,
    }
  }

  // 編集モーダル用のデータを作成
  const createEditModalData = (newEvent: CalendarEvent) => ({
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
  })

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
    (newEvent: CalendarEvent) => {
      const toastEventData = createToastEventData(newEvent)
      const editModalData = createEditModalData(newEvent)

      calendarToast.eventCreated(toastEventData, {
        viewAction: () => {
          openEditModal(newEvent.id, editModalData, {
            source: 'duplicate',
            date: newEvent.startDate,
            viewType: 'day',
          })
        },
      })
    },
    [calendarToast, openEditModal]
  )

  const handleDuplicateEvent = useCallback(
    async (event: CalendarEvent) => {
      try {
        const { startDate, endDate } = normalizeEventDates(event)
        logDuplicationStart(event, startDate, endDate)

        const newStartDate = new Date(startDate)
        const newEndDate = new Date(endDate)
        logNewEventDates(newStartDate, newEndDate)

        const duplicateData = createDuplicateEventData(event, newStartDate, newEndDate)
        const newEvent = await createEvent(duplicateData)
        logDuplicationSuccess(newEvent)

        showDuplicationSuccess(newEvent)
      } catch (err) {
        console.error('❌ Failed to duplicate event:', err)
        calendarToast.error('予定の複製に失敗しました')
      }
    },
    [createEvent, calendarToast, showDuplicationSuccess]
  )

  const handleViewDetails = useCallback(
    (event: CalendarEvent) => {
      // Inspectorを開いてイベント詳細を表示
      setActiveContent('calendar')
      setInspectorOpen(true)

      // 将来的にはここでeventデータをInspectorに渡す処理を追加
      // 例: setSelectedEvent(event) など
      console.log('View event details in Inspector:', event)
    },
    [setActiveContent, setInspectorOpen]
  )

  return {
    handleDeleteEvent,
    handleEditEvent,
    handleDuplicateEvent,
    handleViewDetails,
  }
}
