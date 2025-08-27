'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/shadcn-ui/toast'
import { useEventStore } from '@/features/events/stores/useEventStore'
import { useCreateModalStore } from '@/features/events/stores/useCreateModalStore'
import type { CalendarEvent } from '@/features/events/types/events'

export function useEventContextActions() {
  const { success, error } = useToast()
  const { softDeleteEvent, updateEvent, createEvent } = useEventStore()
  const { openEditModal } = useCreateModalStore()

  const handleDeleteEvent = useCallback(async (event: CalendarEvent) => {
    try {
      // EventStoreのsoftDeleteEventが既にTrashStoreとの統合を行っている
      await softDeleteEvent(event.id)

      success(`「${event.title}」をゴミ箱に移動しました`)
    } catch (err) {
      console.error('Failed to delete event:', err)
      error('イベントの削除に失敗しました')
    }
  }, [softDeleteEvent, success, error])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    // CreateEventModalを編集モードで開く（直接クリックと同じ形式に統一）
    openEditModal(event.id, {
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
      tagIds: event.tags?.map(tag => tag.id) || []
    }, {
      source: 'context-menu',
      date: event.startDate,
      viewType: 'day'
    })
  }, [openEditModal])

  const handleDuplicateEvent = useCallback(async (event: CalendarEvent) => {
    try {
      const startDate = event.startDate || (event.start_time ? new Date(event.start_time) : new Date())
      const endDate = event.endDate || (event.end_time ? new Date(event.end_time) : new Date())
      
      console.log('🔍 Duplicating event:', {
        original: {
          title: event.title,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      })
      
      // 同じ日時に設定（複製）
      const newStartDate = new Date(startDate)
      const newEndDate = new Date(endDate)

      console.log('📅 New event dates:', {
        newStartDate: newStartDate.toISOString(),
        newEndDate: newEndDate.toISOString()
      })

      // イベントストアに新しいイベントを作成
      const newEvent = await createEvent({
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
        tagIds: event.tags?.map(tag => tag.id) || []
      })

      console.log('✅ Duplicated event created:', {
        id: newEvent.id,
        title: newEvent.title,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate
      })

      success(`「${event.title}」を複製しました`)
    } catch (err) {
      console.error('❌ Failed to duplicate event:', err)
      error('イベントの複製に失敗しました')
    }
  }, [createEvent, success, error])

  const handleViewDetails = useCallback((event: CalendarEvent) => {
    // イベント詳細表示の処理
    console.log('View event details:', event)
    // TODO: 詳細モーダルの呼び出し
  }, [])

  return {
    handleDeleteEvent,
    handleEditEvent,
    handleDuplicateEvent,
    handleViewDetails
  }
}