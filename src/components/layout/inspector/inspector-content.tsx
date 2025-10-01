'use client'

import React, { useCallback, Suspense } from 'react'

import { usePathname } from 'next/navigation'

import type { CalendarEvent } from '@/features/events'
import { cn } from '@/lib/utils'

import { CalendarInspectorContent } from './content/CalendarInspectorContent'
import { DefaultInspectorContent } from './content/DefaultInspectorContent'
import { TaskInspectorContent } from './content/TaskInspectorContent'
import { useInspectorStore } from './stores/inspector.store'

// 遅延ロード: EventDetailInspectorContentは重いコンポーネント（588行）のため、使用時のみロード
const EventDetailInspectorContent = React.lazy(() =>
  import('@/features/events/components/inspector/EventDetailInspectorContent').then((module) => ({
    default: module.EventDetailInspectorContent,
  }))
)

// ローディングフォールバック
const InspectorSkeleton = () => (
  <div className="h-full w-full animate-pulse space-y-4 p-4">
    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
    <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
    <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
  </div>
)

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
            <Suspense fallback={<InspectorSkeleton />}>
              <EventDetailInspectorContent
                event={selectedEvent}
                mode="view"
                onSave={handleEventSave}
                onDelete={handleEventDelete}
                onDuplicate={handleEventDuplicate}
                onTemplateCreate={handleTemplateCreate}
                onClose={handleClose}
              />
            </Suspense>
          ) : <CalendarInspectorContent />
        case 'create-event':
          return (
            <Suspense fallback={<InspectorSkeleton />}>
              <EventDetailInspectorContent
                event={null}
                mode="create"
                onSave={handleEventSave}
                onClose={handleClose}
              />
            </Suspense>
          )
        default:
          return <DefaultInspectorContent />
      }
    }
    
    // パスに基づいた自動判定
    if ((pathname || "/").startsWith('/calendar')) {
      return <CalendarInspectorContent />
    }
    
    if ((pathname || "/").startsWith('/tasks')) {
      return <TaskInspectorContent />
    }
    
    return <DefaultInspectorContent />
  }
  
  return (
    <div className={cn(
      'flex-1 overflow-auto',
      'bg-white dark:bg-neutral-800'
    )}>
      {getContentComponent()}
    </div>
  )
}