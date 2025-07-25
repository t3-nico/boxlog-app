import { createClient } from './client'
import type { EventFormData } from '@/components/add-popup/EventCreateForm'

const supabase = createClient()

export async function createEvent(formData: EventFormData) {
  try {
    // APIエンドポイントを使用して作成
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create event')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

export async function getEvents(startDate?: string, endDate?: string) {
  try {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    const response = await fetch(`/api/events?${params.toString()}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch events')
    }

    const data = await response.json()
    return data.events || []
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}