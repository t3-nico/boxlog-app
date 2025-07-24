import { isSameDay, differenceInMinutes, differenceInDays } from 'date-fns'
import type { Event } from '@/types/events'
import type { CalendarEvent } from '../types'

/**
 * Event型をCalendarEvent型に変換する
 */
export function convertEventToCalendarEvent(event: Event): CalendarEvent {
  const startDate = event.startDate
  const endDate = event.endDate || event.startDate
  const isMultiDay = !isSameDay(startDate, endDate)
  
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate,
    endDate,
    isAllDay: event.isAllDay,
    type: event.type,
    status: event.status,
    color: event.color,
    location: event.location,
    url: event.url,
    tags: event.tags,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    // Display-specific properties
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: differenceInMinutes(endDate, startDate),
    isMultiDay,
    isRecurring: !!event.recurrencePattern
  }
}

/**
 * Event配列をCalendarEvent配列に変換する
 */
export function convertEventsToCalendarEvents(events: Event[]): CalendarEvent[] {
  return events.map(convertEventToCalendarEvent)
}