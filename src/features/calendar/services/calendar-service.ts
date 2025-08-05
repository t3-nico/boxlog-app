import { createClient } from '@/lib/supabase/client'
import type {
  Calendar,
  CreateCalendarInput,
  UpdateCalendarInput,
  CalendarShare,
  CalendarShareInput,
  CalendarViewState
} from '../types/calendar.types'

export class CalendarService {
  private supabase = createClient()

  // ========================================
  // カレンダー管理
  // ========================================

  async getCalendars(userId: string): Promise<Calendar[]> {
    const { data, error } = await this.supabase
      .from('calendars')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error
    return this.transformCalendars(data || [])
  }

  async getCalendar(calendarId: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase
      .from('calendars')
      .select('*')
      .eq('id', calendarId)
      .single()

    if (error) throw error
    return data ? this.transformCalendar(data) : null
  }

  async createCalendar(userId: string, input: CreateCalendarInput): Promise<Calendar> {
    const { data, error } = await this.supabase
      .from('calendars')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        color: input.color || '#3b82f6',
        is_default: input.isDefault || false,
        provider: 'local'
      })
      .select()
      .single()

    if (error) throw error
    return this.transformCalendar(data)
  }

  async updateCalendar(calendarId: string, input: UpdateCalendarInput): Promise<Calendar> {
    const updateData: any = {}
    
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.color !== undefined) updateData.color = input.color
    if (input.isVisible !== undefined) updateData.is_visible = input.isVisible
    if (input.shareSettings !== undefined) updateData.share_settings = input.shareSettings

    const { data, error } = await this.supabase
      .from('calendars')
      .update(updateData)
      .eq('id', calendarId)
      .select()
      .single()

    if (error) throw error
    return this.transformCalendar(data)
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calendars')
      .delete()
      .eq('id', calendarId)

    if (error) throw error
  }

  async setDefaultCalendar(calendarId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calendars')
      .update({ is_default: true })
      .eq('id', calendarId)

    if (error) throw error
  }

  // ========================================
  // カレンダー共有
  // ========================================

  async shareCalendar(input: CalendarShareInput): Promise<CalendarShare> {
    const shareData: any = {
      calendar_id: input.calendarId,
      permission: input.permission,
      is_public_link: false
    }

    if (input.sharedWithEmail) {
      shareData.shared_with_email = input.sharedWithEmail
    }
    if (input.sharedWithUserId) {
      shareData.shared_with_user_id = input.sharedWithUserId
    }
    if (input.expiresAt) {
      shareData.expires_at = input.expiresAt.toISOString()
    }

    const { data, error } = await this.supabase
      .from('calendar_shares')
      .insert(shareData)
      .select()
      .single()

    if (error) throw error
    return this.transformCalendarShare(data)
  }

  async getCalendarShares(calendarId: string): Promise<CalendarShare[]> {
    const { data, error } = await this.supabase
      .from('calendar_shares')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(this.transformCalendarShare)
  }

  async updateCalendarShare(shareId: string, permission: 'view' | 'edit' | 'admin'): Promise<CalendarShare> {
    const { data, error } = await this.supabase
      .from('calendar_shares')
      .update({ permission })
      .eq('id', shareId)
      .select()
      .single()

    if (error) throw error
    return this.transformCalendarShare(data)
  }

  async revokeCalendarShare(shareId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calendar_shares')
      .delete()
      .eq('id', shareId)

    if (error) throw error
  }

  async createPublicShareLink(calendarId: string, permission: 'view' | 'edit', expiresInDays?: number): Promise<string> {
    const shareToken = this.generateShareToken()
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined

    const { error } = await this.supabase
      .from('calendar_shares')
      .insert({
        calendar_id: calendarId,
        permission,
        share_token: shareToken,
        is_public_link: true,
        expires_at: expiresAt?.toISOString()
      })

    if (error) throw error
    return shareToken
  }

  // ========================================
  // ビュー状態管理
  // ========================================

  async getViewState(userId: string): Promise<CalendarViewState | null> {
    const { data, error } = await this.supabase
      .from('calendar_view_states')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data ? this.transformViewState(data) : null
  }

  async updateViewState(userId: string, updates: Partial<CalendarViewState>): Promise<CalendarViewState> {
    const updateData: any = {}

    if (updates.defaultView !== undefined) updateData.default_view = updates.defaultView
    if (updates.selectedCalendars !== undefined) updateData.selected_calendars = updates.selectedCalendars
    if (updates.filterTags !== undefined) updateData.filter_tags = updates.filterTags
    if (updates.filterPriority !== undefined) updateData.filter_priority = updates.filterPriority
    if (updates.filterStatus !== undefined) updateData.filter_status = updates.filterStatus
    if (updates.showWeekends !== undefined) updateData.show_weekends = updates.showWeekends
    if (updates.showWeekNumbers !== undefined) updateData.show_week_numbers = updates.showWeekNumbers
    if (updates.firstDayOfWeek !== undefined) updateData.first_day_of_week = updates.firstDayOfWeek
    if (updates.timeFormat !== undefined) updateData.time_format = updates.timeFormat
    if (updates.customSettings !== undefined) updateData.custom_settings = updates.customSettings

    const { data, error } = await this.supabase
      .from('calendar_view_states')
      .upsert({
        user_id: userId,
        ...updateData
      })
      .select()
      .single()

    if (error) throw error
    return this.transformViewState(data)
  }

  // ========================================
  // ヘルパー関数
  // ========================================

  private transformCalendar(data: any): Calendar {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      color: data.color,
      isDefault: data.is_default,
      isVisible: data.is_visible,
      provider: data.provider,
      externalId: data.external_id,
      syncToken: data.sync_token,
      lastSyncedAt: data.last_synced_at ? new Date(data.last_synced_at) : undefined,
      isShared: data.is_shared,
      shareSettings: data.share_settings,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private transformCalendars(data: any[]): Calendar[] {
    return data.map(this.transformCalendar)
  }

  private transformCalendarShare(data: any): CalendarShare {
    return {
      id: data.id,
      calendarId: data.calendar_id,
      sharedWithUserId: data.shared_with_user_id,
      sharedWithEmail: data.shared_with_email,
      permission: data.permission,
      shareToken: data.share_token,
      isPublicLink: data.is_public_link,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by
    }
  }

  private transformViewState(data: any): CalendarViewState {
    return {
      id: data.id,
      userId: data.user_id,
      defaultView: data.default_view,
      selectedCalendars: data.selected_calendars || [],
      filterTags: data.filter_tags,
      filterPriority: data.filter_priority,
      filterStatus: data.filter_status,
      showWeekends: data.show_weekends,
      showWeekNumbers: data.show_week_numbers,
      firstDayOfWeek: data.first_day_of_week,
      timeFormat: data.time_format,
      customSettings: data.custom_settings,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private generateShareToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }
}

export const calendarService = new CalendarService()