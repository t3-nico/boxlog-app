'use client'

import React, { useEffect } from 'react'
import { useCreateModalStore, useCreateModalKeyboardShortcuts } from '../../stores/useCreateModalStore'
import { EssentialCreate } from './EssentialCreate'
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
    tags: [] // 既存のtagIdsから変換が必要な場合
  }
  
  const handleSave = async (data: {
    title: string
    date: Date
    endDate: Date
    tags: { id: string; name: string; color: string }[]
  }) => {
    // EssentialCreateのデータをCreateEventRequestに変換
    const createRequest: CreateEventRequest = {
      title: data.title,
      description: '',
      type: 'task',
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
  }
  
  return (
    <EssentialCreate
      isOpen={isOpen}
      onClose={closeModal}
      onSave={handleSave}
      initialData={convertedInitialData}
    />
  )
}