import { createClient } from '@/lib/supabase/client'
import type {
  ExtendedEvent,
  CreateEventInput,
  UpdateEventInput,
  RecurrencePattern,
  EventInstance,
  CalendarFilter
} from '../types/calendar.types'

export class EventService {
  private supabase = createClient()

  // ========================================
  // イベント管理
  // ========================================

  async getEvents(filter: CalendarFilter): Promise<ExtendedEvent[]> {
    let query = this.supabase
      .from('events')
      .select(`
        *,
        tags:event_tags(
          tag:tags(*)
        ),
        calendar:calendars(*)
      `)
      .gte('planned_start', filter.startDate.toISOString())
      .lte('planned_start', filter.endDate.toISOString())
      .order('planned_start', { ascending: true })

    // フィルター条件を適用
    if (filter.calendarIds && filter.calendarIds.length > 0) {
      query = query.in('calendar_id', filter.calendarIds)
    }
    if (filter.status && filter.status.length > 0) {
      query = query.in('status', filter.status)
    }
    if (filter.priority && filter.priority.length > 0) {
      query = query.in('priority', filter.priority)
    }
    if (filter.includeAllDay === false) {
      query = query.eq('all_day', false)
    }

    const { data, error } = await query

    if (error) throw error

    // タグフィルターは取得後に適用
    let events = (data || []).map((event: any) => this.transformEvent(event))
    
    if (filter.tags && filter.tags.length > 0) {
      events = events.filter(event => 
        event.tags?.some((tag: any) => filter.tags!.includes(tag.id))
      )
    }

    // 繰り返しイベントのインスタンスを取得して追加
    if (filter.includeRecurring !== false) {
      const recurringEvents = await this.getRecurringEventInstances(filter)
      events = [...events, ...recurringEvents]
    }

    return events
  }

  async getEvent(eventId: string): Promise<ExtendedEvent | null> {
    const { data, error } = await this.supabase
      .from('events')
      .select(`
        *,
        tags:event_tags(
          tag:tags(*)
        ),
        calendar:calendars(*)
      `)
      .eq('id', eventId)
      .single()

    if (error) throw error
    return data ? this.transformEvent(data) : null
  }

  async createEvent(userId: string, input: CreateEventInput): Promise<ExtendedEvent> {
    // トランザクションで実行
    const { data: event, error: eventError } = await this.supabase
      .from('events')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        calendar_id: input.calendarId,
        planned_start: input.plannedStart?.toISOString(),
        planned_end: input.plannedEnd?.toISOString(),
        all_day: input.allDay || false,
        status: input.status || 'inbox',
        priority: input.priority,
        color: input.color || '#3b82f6',
        location: input.location,
        url: input.url,
        reminder_minutes: input.reminderMinutes,
        timezone: input.timezone || 'Asia/Tokyo',
        visibility: input.visibility || 'private',
        attendees: input.attendees || [],
        items: input.items || []
      })
      .select()
      .single()

    if (eventError) throw eventError

    // タグを関連付け
    if (input.tags && input.tags.length > 0) {
      const tagRelations = input.tags.map(tagId => ({
        event_id: event.id,
        tag_id: tagId
      }))

      const { error: tagError } = await this.supabase
        .from('event_tags')
        .insert(tagRelations)

      if (tagError) throw tagError
    }

    // 繰り返し設定を作成
    if (input.recurrence) {
      await this.createRecurrencePattern(event.id, input.recurrence)
    }

    return this.getEvent(event.id) as Promise<ExtendedEvent>
  }

  async updateEvent(eventId: string, input: UpdateEventInput): Promise<ExtendedEvent> {
    const updateData: any = {}

    // 更新するフィールドのみ設定
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.calendarId !== undefined) updateData.calendar_id = input.calendarId
    if (input.plannedStart !== undefined) updateData.planned_start = input.plannedStart?.toISOString()
    if (input.plannedEnd !== undefined) updateData.planned_end = input.plannedEnd?.toISOString()
    if (input.allDay !== undefined) updateData.all_day = input.allDay
    if (input.status !== undefined) updateData.status = input.status
    if (input.priority !== undefined) updateData.priority = input.priority
    if (input.color !== undefined) updateData.color = input.color
    if (input.location !== undefined) updateData.location = input.location
    if (input.url !== undefined) updateData.url = input.url
    if (input.reminderMinutes !== undefined) updateData.reminder_minutes = input.reminderMinutes
    if (input.timezone !== undefined) updateData.timezone = input.timezone
    if (input.visibility !== undefined) updateData.visibility = input.visibility
    if (input.attendees !== undefined) updateData.attendees = input.attendees
    if (input.items !== undefined) updateData.items = input.items

    const { error: updateError } = await this.supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)

    if (updateError) throw updateError

    // タグを更新
    if (input.tags !== undefined) {
      // 既存のタグを削除
      await this.supabase
        .from('event_tags')
        .delete()
        .eq('event_id', eventId)

      // 新しいタグを追加
      if (input.tags.length > 0) {
        const tagRelations = input.tags.map(tagId => ({
          event_id: eventId,
          tag_id: tagId
        }))

        const { error: tagError } = await this.supabase
          .from('event_tags')
          .insert(tagRelations)

        if (tagError) throw tagError
      }
    }

    return this.getEvent(eventId) as Promise<ExtendedEvent>
  }

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
  }

  // ========================================
  // 繰り返しイベント管理
  // ========================================

  async createRecurrencePattern(eventId: string, pattern: Omit<RecurrencePattern, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>): Promise<RecurrencePattern> {
    const { data, error } = await this.supabase
      .from('recurrence_patterns')
      .insert({
        event_id: eventId,
        frequency: pattern.frequency,
        interval: pattern.interval,
        weekdays: pattern.weekdays,
        monthly_type: pattern.monthlyType,
        day_of_month: pattern.dayOfMonth,
        week_of_month: pattern.weekOfMonth,
        end_type: pattern.endType,
        occurrences: pattern.occurrences,
        end_date: pattern.endDate?.toISOString(),
        excluded_dates: pattern.excludedDates?.map(d => d.toISOString()),
        timezone: pattern.timezone
      })
      .select()
      .single()

    if (error) throw error

    // イベントの繰り返しフラグを更新
    await this.supabase
      .from('events')
      .update({ is_recurring: true })
      .eq('id', eventId)

    return this.transformRecurrencePattern(data)
  }

  async updateRecurrencePattern(patternId: string, updates: Partial<RecurrencePattern>): Promise<RecurrencePattern> {
    const updateData: any = {}

    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.interval !== undefined) updateData.interval = updates.interval
    if (updates.weekdays !== undefined) updateData.weekdays = updates.weekdays
    if (updates.monthlyType !== undefined) updateData.monthly_type = updates.monthlyType
    if (updates.dayOfMonth !== undefined) updateData.day_of_month = updates.dayOfMonth
    if (updates.weekOfMonth !== undefined) updateData.week_of_month = updates.weekOfMonth
    if (updates.endType !== undefined) updateData.end_type = updates.endType
    if (updates.occurrences !== undefined) updateData.occurrences = updates.occurrences
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate?.toISOString()
    if (updates.excludedDates !== undefined) updateData.excluded_dates = updates.excludedDates?.map(d => d.toISOString())

    const { data, error } = await this.supabase
      .from('recurrence_patterns')
      .update(updateData)
      .eq('id', patternId)
      .select()
      .single()

    if (error) throw error
    return this.transformRecurrencePattern(data)
  }

  async deleteRecurrencePattern(eventId: string): Promise<void> {
    const { error } = await this.supabase
      .from('recurrence_patterns')
      .delete()
      .eq('event_id', eventId)

    if (error) throw error

    // イベントの繰り返しフラグを解除
    await this.supabase
      .from('events')
      .update({ is_recurring: false })
      .eq('id', eventId)
  }

  async getRecurringEventInstances(filter: CalendarFilter): Promise<ExtendedEvent[]> {
    // 繰り返しイベントのインスタンスを取得
    let query = this.supabase
      .from('event_instances')
      .select(`
        *,
        event:events(
          *,
          tags:event_tags(
            tag:tags(*)
          ),
          calendar:calendars(*)
        )
      `)
      .gte('instance_start', filter.startDate.toISOString())
      .lte('instance_start', filter.endDate.toISOString())
      .eq('is_exception', false)

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((instance: any) => {
      const baseEvent = this.transformEvent(instance.event)
      
      // インスタンスの日時で上書き
      return {
        ...baseEvent,
        id: `${baseEvent.id}_${instance.id}`,
        plannedStart: new Date(instance.instance_start),
        plannedEnd: new Date(instance.instance_end),
        displayStartDate: new Date(instance.instance_start),
        displayEndDate: new Date(instance.instance_end),
        isRecurring: true
      } as ExtendedEvent
    })
  }

  async createEventInstance(eventId: string, instanceDate: Date, duration: number): Promise<EventInstance> {
    const instanceStart = instanceDate
    const instanceEnd = new Date(instanceDate.getTime() + duration * 60 * 1000)

    const { data, error } = await this.supabase
      .from('event_instances')
      .insert({
        event_id: eventId,
        instance_start: instanceStart.toISOString(),
        instance_end: instanceEnd.toISOString(),
        is_exception: false
      })
      .select()
      .single()

    if (error) throw error
    return this.transformEventInstance(data)
  }

  async updateEventInstance(instanceId: string, overrides: Partial<ExtendedEvent>): Promise<EventInstance> {
    const { data, error } = await this.supabase
      .from('event_instances')
      .update({
        is_exception: true,
        exception_type: 'modified',
        overrides
      })
      .eq('id', instanceId)
      .select()
      .single()

    if (error) throw error
    return this.transformEventInstance(data)
  }

  // ========================================
  // ヘルパー関数
  // ========================================

  private transformEvent(data: any): ExtendedEvent {
    const tags = data.tags?.map((t: any) => t.tag) || []
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startDate: data.planned_start ? new Date(data.planned_start) : new Date(),
      endDate: data.planned_end ? new Date(data.planned_end) : undefined,
      status: data.status,
      priority: data.priority,
      color: data.color,
      location: data.location,
      url: data.url,
      tags,
      items: data.items || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      displayStartDate: data.planned_start ? new Date(data.planned_start) : new Date(),
      displayEndDate: data.planned_end ? new Date(data.planned_end) : new Date(),
      duration: data.planned_start && data.planned_end 
        ? Math.floor((new Date(data.planned_end).getTime() - new Date(data.planned_start).getTime()) / 1000 / 60)
        : 0,
      isMultiDay: data.all_day || (data.planned_start && data.planned_end && 
        new Date(data.planned_start).toDateString() !== new Date(data.planned_end).toDateString()),
      isRecurring: data.is_recurring,
      calendarId: data.calendar_id,
      allDay: data.all_day,
      reminderMinutes: data.reminder_minutes,
      timezone: data.timezone,
      attendees: data.attendees || [],
      attachments: data.attachments || [],
      visibility: data.visibility,
      externalId: data.external_id,
      syncStatus: data.sync_status
    }
  }

  private transformRecurrencePattern(data: any): RecurrencePattern {
    return {
      id: data.id,
      eventId: data.event_id,
      frequency: data.frequency,
      interval: data.interval,
      weekdays: data.weekdays,
      monthlyType: data.monthly_type,
      dayOfMonth: data.day_of_month,
      weekOfMonth: data.week_of_month,
      endType: data.end_type,
      occurrences: data.occurrences,
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      excludedDates: data.excluded_dates?.map((d: string) => new Date(d)),
      timezone: data.timezone,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private transformEventInstance(data: any): EventInstance {
    return {
      id: data.id,
      eventId: data.event_id,
      recurrencePatternId: data.recurrence_pattern_id,
      instanceStart: new Date(data.instance_start),
      instanceEnd: new Date(data.instance_end),
      isException: data.is_exception,
      exceptionType: data.exception_type,
      overrides: data.overrides,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}

export const eventService = new EventService()