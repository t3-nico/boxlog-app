'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

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
  const handleEventSave = (eventData: any) => {
    // TODO: イベント保存処理を実装
    console.log('Save event:', eventData)
  }

  const handleEventDelete = (eventId: string) => {
    // TODO: イベント削除処理を実装
    console.log('Delete event:', eventId)
    setSelectedEvent(null)
    setActiveContent('calendar')
  }

  const handleEventDuplicate = (event: any) => {
    // TODO: イベント複製処理を実装
    console.log('Duplicate event:', event)
  }

  const handleTemplateCreate = (event: any) => {
    // TODO: テンプレート作成処理を実装
    console.log('Create template:', event)
  }

  const handleClose = () => {
    setSelectedEvent(null)
    setActiveContent('calendar')
  }

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