'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useEventStore } from '@/features/events'
import { TrashView } from '@/features/calendar/components/calendar-grid/TrashView'
import type { CalendarEvent, UpdateEventRequest } from '@/features/events'

export default function TrashPage() {
  const eventStore = useEventStore()
  const { events } = eventStore
  
  // 削除済みイベントを取得してCalendarEvent型に変換
  const trashedEvents = useMemo(() => {
    return events
      .filter(event => event.isDeleted && event.deletedAt)
      .map(event => ({
        ...event,
        startDate: event.startDate || new Date(),
        endDate: event.endDate || new Date(),
        displayStartDate: event.startDate || new Date(),
        displayEndDate: event.endDate || new Date(),
        duration: event.endDate && event.startDate 
          ? (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60)
          : 60,
        isMultiDay: event.startDate && event.endDate 
          ? event.startDate.toDateString() !== event.endDate.toDateString()
          : false,
        isRecurring: event.isRecurring || false,
        type: event.type || 'event' as any
      }))
  }, [events])
  
  const handleRestore = useCallback(async (eventId: string) => {
    try {
      const eventToRestore = events.find(e => e.id === eventId)
      if (eventToRestore) {
        const updateRequest: UpdateEventRequest = {
          ...eventToRestore,
          isDeleted: false,
          deletedAt: null
        }
        await eventStore.updateEvent(updateRequest)
        console.log('🔄 Event restored:', eventToRestore.title)
      }
    } catch (error) {
      console.error('Failed to restore event:', error)
    }
  }, [events, eventStore])
  
  const handleDeletePermanently = useCallback(async (eventIds: string[]) => {
    try {
      await Promise.all(eventIds.map(id => eventStore.deleteEvent(id)))
      console.log('💀 Events permanently deleted:', eventIds.length)
    } catch (error) {
      console.error('Failed to permanently delete events:', error)
    }
  }, [eventStore])
  
  const handleClose = useCallback(() => {
    // 設定ページなので閉じるボタンは無効にする、または前のページに戻る
    window.history.back()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <TrashView
        onClose={handleClose}
        trashedEvents={trashedEvents}
        onRestore={handleRestore}
        onDeletePermanently={handleDeletePermanently}
        isModal={false}
      />
    </div>
  )
}