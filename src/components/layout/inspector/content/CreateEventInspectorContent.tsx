'use client'

import React from 'react'
import { useCreateModalStore } from '@/features/events/stores/useCreateModalStore'
import { useInspectorStore } from '../stores/inspector.store'
import { EssentialInspectorView } from '@/features/events/components/create/EssentialInspectorView'
import { useCreateEvent } from '@/features/events/hooks/useCreateEvent'
import type { CreateEventRequest } from '@/features/events/types/events'
import { useTagStore } from '@/features/tags/stores/tag-store'
import { useEventStore } from '@/features/events/stores/useEventStore'
import useCalendarToast from '@/features/calendar/lib/toast'
import { background, text } from '@/config/theme/colors'

export function CreateEventInspectorContent() {
  const { 
    initialData, 
    context,
    isEditMode,
    editingEventId,
  } = useCreateModalStore()
  
  const { setInspectorOpen, setActiveContent } = useInspectorStore()
  const { createEvent, isCreating, error } = useCreateEvent()
  const { updateEvent, softDeleteEvent } = useEventStore()
  const { getTagsByIds } = useTagStore()
  const toast = useCalendarToast()

  // EssentialCreateに渡すデータの変換
  const convertedInitialData = {
    title: initialData.title || '',
    date: initialData.startDate || context?.date || new Date(),
    endDate: initialData.endDate || (initialData.startDate ? new Date(initialData.startDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000)),
    description: initialData.description || '',
    tags: initialData.tagIds ? getTagsByIds(initialData.tagIds).map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color
    })) : []
  }

  // Inspectorを閉じる処理
  const handleClose = () => {
    // カスタムイベントを発行してドラッグ選択状態をクリア
    window.dispatchEvent(new CustomEvent('calendar-drag-cancel'))
    setActiveContent(null)
    // Inspectorは開いたままにして、コンテンツのみクリア
  }

  const handleSave = async (data: {
    title: string
    date: Date
    endDate: Date
    tags: { id: string; name: string; color: string }[]
    description?: string
  }) => {
    
    // EssentialSingleViewのデータをCreateEventRequestに変換
    const createRequest: CreateEventRequest = {
      title: data.title,
      description: data.description || '',
      type: 'event',
      status: 'planned',
      priority: 'necessary',
      color: '#3b82f6',
      startDate: data.date,
      endDate: data.endDate,
      isRecurring: false,
      location: '',
      url: '',
      reminders: [],
      items: [],
      tagIds: data.tags.map(tag => tag.id)
    }
    
    try {
      if (isEditMode && editingEventId) {
        // 編集モード：既存イベントを更新
        await toast.promise(
          updateEvent({
            id: editingEventId,
            ...createRequest
          }),
          {
            loading: '予定を更新中...',
            success: '予定を更新しました',
            error: '更新に失敗しました'
          }
        )
      } else {
        // 新規作成モード
        const event = await toast.promise(
          createEvent(createRequest),
          {
            loading: '予定を作成中...',
            success: (event) => `「${event?.title || data.title}」を作成しました`,
            error: '作成に失敗しました'
          }
        )
      }
      
      // 成功後はInspectorコンテンツをクリアするが、Inspectorは開いたまま
      setActiveContent(null)
    } catch (error) {
      console.error('Event save error:', error)
    }
  }

  const handleDelete = async () => {
    if (editingEventId) {
      try {
        // Calendar Toast用のイベントデータを作成
        const eventData = {
          id: editingEventId,
          title: convertedInitialData.title || 'イベント',
          displayStartDate: convertedInitialData.date || new Date(),
          displayEndDate: convertedInitialData.endDate || new Date(),
          duration: convertedInitialData.date && convertedInitialData.endDate ? 
            Math.round((convertedInitialData.endDate.getTime() - convertedInitialData.date.getTime()) / (1000 * 60)) : 60,
          isMultiDay: convertedInitialData.date && convertedInitialData.endDate ? 
            convertedInitialData.date.toDateString() !== convertedInitialData.endDate.toDateString() : false,
          isRecurring: false
        }
        
        // 楽観的UI更新のための削除実行
        await softDeleteEvent(editingEventId)
        
        // Toast表示（アンドゥ付き）
        toast.eventDeleted(eventData, async () => {
          try {
            // アンドゥ処理（復元）
            toast.success('予定を復元しました')
          } catch (error) {
            toast.error('復元に失敗しました')
          }
        })
        
        setActiveContent(null)
      } catch (error) {
        toast.error('削除に失敗しました')
        console.error('Delete error:', error)
      }
    }
  }

  return (
    <EssentialInspectorView
      onClose={handleClose}
      onSave={handleSave}
      onDelete={isEditMode ? handleDelete : undefined}
      initialData={convertedInitialData}
      isEditMode={isEditMode}
    />
  )
}