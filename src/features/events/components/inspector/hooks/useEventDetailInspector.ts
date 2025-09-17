'use client'

import { useState } from 'react'
import type { CalendarEvent } from '@/features/events'

export interface EventDetailInspectorData {
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date | null
  tags: any[]
  isRecurring: boolean
  reminders: any[]
}

export interface UseEventDetailInspectorProps {
  event?: CalendarEvent | null
  mode?: 'view' | 'create' | 'edit'
  onSave?: (eventData: Partial<CalendarEvent>) => void
  onDelete?: (eventId: string) => void
  onDuplicate?: (event: CalendarEvent) => void
  onTemplateCreate?: (event: CalendarEvent) => void
  onClose?: () => void
}

export const useEventDetailInspector = ({
  event,
  mode = event ? 'view' : 'create',
  onSave,
  onDelete,
  onDuplicate,
  onTemplateCreate,
  onClose
}: UseEventDetailInspectorProps) => {

  // UI状態管理
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const [showTimeline, setShowTimeline] = useState(true)

  // フォームデータ管理
  const [formData, setFormData] = useState<EventDetailInspectorData>({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startDate: event?.startDate || new Date(),
    endDate: event?.endDate || null,
    tags: event?.tags || [],
    isRecurring: event?.isRecurring || false,
    reminders: event?.reminders || []
  })

  // フォームデータ更新
  const updateFormData = (field: keyof EventDetailInspectorData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // バルクフォームデータ更新
  const updateFormDataBulk = (updates: Partial<EventDetailInspectorData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))
  }

  // 保存処理
  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
  }

  // 削除処理
  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id)
    }
  }

  // 複製処理
  const handleDuplicate = () => {
    if (event && onDuplicate) {
      onDuplicate(event)
    }
  }

  // テンプレート作成処理
  const handleTemplateCreate = () => {
    if (event && onTemplateCreate) {
      onTemplateCreate(event)
    }
  }

  // バリデーション
  const isValid = formData.title.trim().length > 0

  return {
    // State
    isDetailOpen,
    showTimeline,
    formData,
    mode,
    isValid,

    // Actions
    setIsDetailOpen,
    setShowTimeline,
    updateFormData,
    updateFormDataBulk,
    handleSave,
    handleDelete,
    handleDuplicate,
    handleTemplateCreate,
    onClose
  }
}