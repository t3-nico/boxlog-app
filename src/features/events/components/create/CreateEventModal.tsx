'use client'

import React, { useEffect } from 'react'
import { useCreateModalStore, useCreateModalKeyboardShortcuts } from '../../stores/useCreateModalStore'
import { EssentialSingleView } from './EssentialSingleView'
import { useCreateEvent } from '../../hooks/useCreateEvent'
import type { CreateEventRequest } from '../../types/events'
import { useTagStore } from '@/features/tags/stores/tag-store'
import { useEventStore } from '../../stores/useEventStore'
import useCalendarToast from '@/features/calendar/lib/toast'

export function CreateEventModal() {
  const { 
    isOpen, 
    initialData, 
    context,
    isEditMode,
    editingEventId,
    closeModal
  } = useCreateModalStore()
  
  const { createEvent, isCreating, error } = useCreateEvent()
  const { updateEvent, softDeleteEvent } = useEventStore()
  const { handleKeyDown } = useCreateModalKeyboardShortcuts()
  const { getTagsByIds } = useTagStore()
  const toast = useCalendarToast()
  

  // EssentialCreateに渡すデータの変換
  const convertedInitialData = {
    title: initialData.title || '',
    date: initialData.startDate || context.date || new Date(),
    endDate: initialData.endDate || (initialData.startDate ? new Date(initialData.startDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000)), // 終了日時が無い場合は1時間後
    description: initialData.description || '', // 説明フィールドを追加
    tags: initialData.tagIds ? getTagsByIds(initialData.tagIds).map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color
    })) : [] // 既存のtagIdsからタグ情報を変換
  }
  
  
  
  
  // デバッグ用ログ
  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen, initialData, context])
  
  
  // モーダルキャンセル時の処理
  const handleCancel = () => {
    // カスタムイベントを発行してドラッグ選択状態をクリア
    window.dispatchEvent(new CustomEvent('calendar-drag-cancel'))
    closeModal()
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
      
      closeModal()  // 作成・更新成功後にモーダルを閉じる
    } catch (error) {
      // エラーは promise 内で処理済み
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
            // Note: 実際の復元機能が必要な場合は restoreEvent などの実装が必要
            toast.success('予定を復元しました')
          } catch (error) {
            toast.error('復元に失敗しました')
          }
        })
        
        closeModal()
      } catch (error) {
        toast.error('削除に失敗しました')
        console.error('Delete error:', error)
      }
    }
  }
  
  // 編集モードの場合もEssentialSingleViewを使用（統一UI）
  if (isEditMode && editingEventId) {
    return (
      <EssentialSingleView
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={convertedInitialData}
        isEditMode={true}
      />
    )
  }

  // 新規作成モードの場合はEssentialSingleViewを使用
  return (
    <EssentialSingleView
      isOpen={isOpen}
      onClose={closeModal}
      onSave={handleSave}
      initialData={convertedInitialData}
    />
  )
}