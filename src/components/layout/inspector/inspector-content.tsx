'use client'

import React, { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { colors } from '@/config/theme'
import type { CalendarEvent } from '@/features/events'
import { EventDetailInspectorContent } from '@/features/events/components/inspector/EventDetailInspectorContent'
import { cn } from '@/lib/utils'

import { CalendarInspectorContent } from './content/CalendarInspectorContent'
import { DefaultInspectorContent } from './content/DefaultInspectorContent'
import { TaskInspectorContent } from './content/TaskInspectorContent'
import { useInspectorStore } from './stores/inspector.store'

export const InspectorContent = () => {
  const pathname = usePathname()
  const activeContent = useInspectorStore((state) => state.activeContent)
  const selectedEvent = useInspectorStore((state) => state.selectedEvent)
  const { setActiveContent, setSelectedEvent } = useInspectorStore()
  
  // イベント詳細のハンドラー
  const handleEventSave = useCallback((eventData: Partial<CalendarEvent>) => {
    // Event handling tracked in Issue #89
    console.log('Save event:', eventData)
  }, [])

  const handleEventDelete = useCallback((eventId: string) => {
    // Event handling tracked in Issue #89
    console.log('Delete event:', eventId)
    setSelectedEvent(null)
    setActiveContent('calendar')
  }, [setSelectedEvent, setActiveContent])

  const handleEventDuplicate = useCallback((event: CalendarEvent) => {
    // Event handling tracked in Issue #89
    console.log('Duplicate event:', event)
  }, [])

  const handleTemplateCreate = useCallback((event: CalendarEvent) => {
    // Template creation tracked in Issue #89
    console.log('Create template:', event)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedEvent(null)
    setActiveContent('calendar')
  }, [setSelectedEvent, setActiveContent])

  // ページに基づいたコンテンツの決定
  const getContentComponent = () => {
    // 明示的にactiveContentが設定されている場合はそれを優先
    if (activeContent) {
      switch (activeContent) {
        case 'calendar':
          return <CalendarInspectorContent />
        case 'task':
          return <TaskInspectorContent />
        case 'event':
          return selectedEvent ? (
            <EventDetailInspectorContent 
              event={selectedEvent}
              mode="view"
              onSave={handleEventSave}
              onDelete={handleEventDelete}
              onDuplicate={handleEventDuplicate}
              onTemplateCreate={handleTemplateCreate}
              onClose={handleClose}
            />
          ) : <CalendarInspectorContent />
        case 'create-event':
          return (
            <EventDetailInspectorContent 
              event={null}
              mode="create"
              onSave={handleEventSave}
              onClose={handleClose}
            />
          )
        default:
          return <DefaultInspectorContent />
      }
    }
    
    // パスに基づいた自動判定
    if (pathname.startsWith('/calendar')) {
      return <CalendarInspectorContent />
    }
    
    if (pathname.startsWith('/tasks')) {
      return <TaskInspectorContent />
    }
    
    return <DefaultInspectorContent />
  }
  
  return (
    <div className={cn(
      'flex-1 overflow-auto',
      colors.background.surface
    )}>
      {getContentComponent()}
    </div>
  )
}