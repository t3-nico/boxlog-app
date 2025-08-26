'use client'

import React, { useEffect } from 'react'
import { useCreateModalStore, useCreateModalKeyboardShortcuts } from '../../stores/useCreateModalStore'
import { EssentialSingleView } from './EssentialSingleView'
import { useCreateEvent } from '../../hooks/useCreateEvent'
import type { CreateEventRequest } from '../../types/events'

export function CreateEventModal() {
  const { 
    isOpen, 
    initialData, 
    context,
    closeModal
  } = useCreateModalStore()
  
  const { createEvent, isCreating, error } = useCreateEvent()
  const { handleKeyDown } = useCreateModalKeyboardShortcuts()
  
  // EssentialCreateに渡すデータの変換
  const convertedInitialData = {
    title: initialData.title || '',
    date: initialData.startDate || context.date || new Date(),
    endDate: initialData.endDate || (initialData.startDate ? new Date(initialData.startDate.getTime() + 60 * 60 * 1000) : undefined), // 1時間後
    tags: [] // 既存のtagIdsから変換が必要な場合
  }
  
  console.log('🔄 CreateEventModal データ変換:', {
    source: context?.source,
    viewType: context?.viewType,
    originalStartDate: initialData.startDate?.toLocaleString(),
    originalEndDate: initialData.endDate?.toLocaleString(),
    contextDate: context?.date?.toLocaleString(),
    convertedDate: convertedInitialData.date.toLocaleString(),
    convertedEndDate: convertedInitialData.endDate?.toLocaleString()
  })
  
  
  // デバッグ用ログ
  useEffect(() => {
    if (isOpen) {
      console.log('📅 CreateEventModal opened with data:', {
        initialData,
        context,
        convertedInitialData
      })
    }
  }, [isOpen, initialData, context])
  
  const handleSave = async (data: {
    title: string
    date: Date
    endDate: Date
    tags: { id: string; name: string; color: string }[]
  }) => {
    // EssentialSingleViewのデータをCreateEventRequestに変換
    const createRequest: CreateEventRequest = {
      title: data.title,
      description: '',
      type: 'event',  // 'task'ではなく'event'を使用
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
    
    await createEvent(createRequest)
    closeModal()  // 作成成功後にモーダルを閉じる
  }
  
  return (
    <EssentialSingleView
      isOpen={isOpen}
      onClose={closeModal}
      onSave={handleSave}
      initialData={convertedInitialData}
    />
  )
}