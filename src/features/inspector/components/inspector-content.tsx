'use client'

import React, { Suspense, useCallback } from 'react'

import { usePathname } from 'next/navigation'

import type { CalendarEvent as CalendarCalendarEvent } from '@/features/calendar/types/calendar.types'
import type { CalendarEvent as EventsCalendarEvent } from '@/features/events'
import { cn } from '@/lib/utils'

import { useInspectorStore } from '@/features/inspector/stores/inspector.store'
import { CalendarInspectorContent } from './content/CalendarInspectorContent'
import { DefaultInspectorContent } from './content/DefaultInspectorContent'
import { TaskInspectorContent } from './content/TaskInspectorContent'

// 遅延ロード: EventDetailInspectorContentは重いコンポーネント（588行）のため、使用時のみロード
const EventDetailInspectorContent = React.lazy(() =>
  import('@/features/events/components/inspector/EventDetailInspectorContent').then((module) => ({
    default: module.EventDetailInspectorContent,
  }))
)

// ローディングフォールバック
const InspectorSkeleton = () => (
  <div className="h-full w-full animate-pulse space-y-4 p-4">
    <div className="bg-muted h-8 rounded" />
    <div className="bg-muted h-32 rounded" />
    <div className="bg-muted h-24 rounded" />
  </div>
)

export const InspectorContent = () => {
  const pathname = usePathname()
  const activeContent = useInspectorStore((state) => state.activeContent)
  const selectedEvent = useInspectorStore((state) => state.selectedEvent)
  const { setActiveContent, setSelectedEvent } = useInspectorStore()

  // イベント詳細のハンドラー
  const handleEventSave = useCallback((eventData: Partial<EventsCalendarEvent>) => {
    // Event handling tracked in Issue #89
    console.log('Save event:', eventData)
  }, [])

  const handleEventDelete = useCallback(
    (eventId: string) => {
      // Event handling tracked in Issue #89
      console.log('Delete event:', eventId)
      setSelectedEvent(null)
      setActiveContent('calendar')
    },
    [setSelectedEvent, setActiveContent]
  )

  const handleEventDuplicate = useCallback((event: EventsCalendarEvent) => {
    // Event handling tracked in Issue #89
    console.log('Duplicate event:', event)
  }, [])

  const handleTemplateCreate = useCallback((event: EventsCalendarEvent) => {
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
                event={selectedEvent as CalendarCalendarEvent}
                mode="view"
                onSave={handleEventSave}
                onDelete={handleEventDelete}
                onDuplicate={handleEventDuplicate as (event: CalendarCalendarEvent) => void}
                onTemplateCreate={handleTemplateCreate as (event: CalendarCalendarEvent) => void}
                onClose={handleClose}
              />
            </Suspense>
          ) : (
            <CalendarInspectorContent />
          )
        case 'create-event':
          return (
            <Suspense fallback={<InspectorSkeleton />}>
              <EventDetailInspectorContent event={null} mode="create" onSave={handleEventSave} onClose={handleClose} />
            </Suspense>
          )
        default:
          return <DefaultInspectorContent />
      }
    }

    // パスに基づいた自動判定
    if ((pathname || '/').startsWith('/calendar')) {
      return <CalendarInspectorContent />
    }

    if ((pathname || '/').startsWith('/tasks')) {
      return <TaskInspectorContent />
    }

    return <DefaultInspectorContent />
  }

  return <div className={cn('flex-1 overflow-auto')}>{getContentComponent()}</div>
}
