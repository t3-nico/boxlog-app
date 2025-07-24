import { createClient } from './client'
import type { EventFormData } from '@/components/add-popup/EventCreateForm'

const supabase = createClient()

export async function createEvent(formData: EventFormData) {
  try {
    // フォームデータをSupabaseテーブル形式に変換
    const eventData = {
      title: formData.title,
      description: formData.description || null,
      start_date: formData.startDate,
      start_time: formData.startTime || null,
      end_date: formData.endDate || null,
      end_time: formData.endTime || null,
      is_all_day: formData.isAllDay,
      event_type: formData.eventType,
      status: formData.status,
      color: formData.color,
      location: formData.location || null,
      url: formData.url || null,
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create event:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

export async function getEvents(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })

    if (startDate) {
      query = query.gte('start_date', startDate)
    }
    if (endDate) {
      query = query.lte('start_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch events:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}