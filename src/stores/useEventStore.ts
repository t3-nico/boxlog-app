import { create } from 'zustand'
import { 
  Event, 
  EventFilters, 
  EventStore,
  CreateEventRequest,
  UpdateEventRequest,
  EventsByDate,
  CalendarEvent
} from '@/types/events'

// ローカルストレージのキー
const STORAGE_KEY = 'boxlog-events'

// ブラウザかどうかを判定
const isBrowser = typeof window !== 'undefined'

// シンプルで確実なlocalStorage操作
const saveToLocalStorage = (events: Event[]) => {
  if (!isBrowser) return
  
  try {
    const eventsToSave = events.map(event => ({
      ...event,
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      updatedAt: event.updatedAt?.toISOString(),
      deletedAt: event.deletedAt?.toISOString(),
    }))
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToSave))
    console.log('💾 Saved events:', events.length)
    
    // 直ちに確認
    const saved = localStorage.getItem(STORAGE_KEY)
    console.log('💾 Saved data exists:', !!saved)
  } catch (error) {
    console.error('💾 Save failed:', error)
  }
}

const loadFromLocalStorage = (): Event[] => {
  if (!isBrowser) return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      console.log('📖 No data in localStorage')
      return []
    }
    
    const parsed = JSON.parse(stored)
    const events = parsed.map((event: any) => ({
      ...event,
      startDate: event.startDate ? new Date(event.startDate) : null,
      endDate: event.endDate ? new Date(event.endDate) : null,
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
      deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
    }))
    
    console.log('📖 Loaded events:', events.length)
    return events
  } catch (error) {
    console.error('📖 Load failed:', error)
    return []
  }
}

// 日付フォーマット関数
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useEventStore = create<EventStore>()((set, get) => ({
  // 初期状態 - シンプルに空配列から開始
  events: [],
  loading: false,
  error: null,
  filters: {},
  selectedEventId: null,
  lastFetchedRange: null,

  // ストア初期化後にローカルストレージから読み込み
  fetchEvents: async (filters?: EventFilters) => {
    console.log('🔄 fetchEvents called')
    set({ loading: true })
    
    // ローカルストレージから読み込み
    const events = loadFromLocalStorage()
    
    set({ 
      events, 
      loading: false,
      error: null 
    })
    
    console.log('🔄 Events loaded from localStorage:', events.length)
  },

  // イベント作成
  createEvent: async (eventData: CreateEventRequest) => {
    console.log('🚀 Creating event:', eventData.title)
    set({ loading: true, error: null })
    
    try {
      const newEvent: Event = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        status: eventData.status || 'inbox',
        priority: eventData.priority,
        color: eventData.color || '#3b82f6',
        isRecurring: eventData.isRecurring || false,
        recurrenceRule: eventData.recurrenceRule,
        items: eventData.items || [],
        location: eventData.location,
        url: eventData.url,
        reminders: eventData.reminders || [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'event' as any,
        isDeleted: false,
        deletedAt: null
      }
      
      console.log('✅ Created event object:', newEvent)
      
      const currentEvents = get().events
      console.log('📊 Current events count:', currentEvents.length)
      
      const newEvents = [...currentEvents, newEvent]
      console.log('📊 New events count:', newEvents.length)
      
      // ストアを更新
      set({ 
        events: newEvents, 
        loading: false 
      })
      
      // ローカルストレージに保存
      saveToLocalStorage(newEvents)
      
      console.log('🎉 Event created successfully:', newEvent.title)
      
      // 確認のため再度ストア状態をチェック
      setTimeout(() => {
        const finalEvents = get().events
        console.log('🔍 Final store check:', finalEvents.length)
      }, 100)
      
      return newEvent
    } catch (error) {
      console.error('❌ Create event failed:', error)
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create event'
      })
      throw error
    }
  },

  // イベント更新
  updateEvent: async (eventData: UpdateEventRequest) => {
    console.log('🔄 Updating event:', eventData.id)
    set({ loading: true, error: null })
    
    try {
      const currentEvents = get().events
      const updatedEvents = currentEvents.map(event => 
        event.id === eventData.id 
          ? { ...event, ...eventData, updatedAt: new Date() }
          : event
      )
      
      set({ 
        events: updatedEvents, 
        loading: false 
      })
      
      saveToLocalStorage(updatedEvents)
      
      const updatedEvent = updatedEvents.find(e => e.id === eventData.id)
      console.log('✅ Event updated:', updatedEvent?.title)
      
      return updatedEvent!
    } catch (error) {
      console.error('❌ Update event failed:', error)
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update event'
      })
      throw error
    }
  },

  // イベント削除
  deleteEvent: async (eventId: string) => {
    console.log('🗑️ Deleting event:', eventId)
    set({ loading: true, error: null })
    
    try {
      const currentEvents = get().events
      const filteredEvents = currentEvents.filter(event => event.id !== eventId)
      
      set({ 
        events: filteredEvents,
        selectedEventId: get().selectedEventId === eventId ? null : get().selectedEventId,
        loading: false 
      })
      
      saveToLocalStorage(filteredEvents)
      
      console.log('✅ Event deleted')
    } catch (error) {
      console.error('❌ Delete event failed:', error)
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete event'
      })
      throw error
    }
  },

  // その他のメソッド
  selectEvent: (eventId: string | null) => {
    set({ selectedEventId: eventId })
  },

  setFilters: (filters: Partial<EventFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  getEventsByDateRange: (startDate: Date, endDate: Date) => {
    const { events } = get()
    console.log('📅 Getting events for date range:', { 
      start: startDate.toDateString(), 
      end: endDate.toDateString(),
      totalEvents: events.length 
    })
    
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    
    const filteredEvents = events.filter(event => {
      if (!event.startDate) return false
      
      const eventStartDateOnly = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate())
      let eventEndDateOnly = eventStartDateOnly
      if (event.endDate) {
        eventEndDateOnly = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate())
      }
      
      return (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
             (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
             (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
    })
    
    console.log('📅 Filtered events result:', filteredEvents.length)
    return filteredEvents
  },

  getEventsGroupedByType: () => {
    const { events } = get()
    const convertToCalendarEvent = (event: Event): CalendarEvent => ({
      ...event,
      displayStartDate: event.startDate || new Date(),
      displayEndDate: event.endDate || event.startDate || new Date(),
      duration: event.endDate && event.startDate
        ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))
        : 60,
      isMultiDay: event.endDate && event.startDate ? 
        formatDate(event.startDate) !== formatDate(event.endDate) : false,
      isRecurring: event.isRecurring || false,
    })
    
    return {
      events: events.filter(e => e.type === 'event').map(convertToCalendarEvent),
      tasks: events.filter(e => e.type === 'task').map(convertToCalendarEvent),
      reminders: events.filter(e => e.type === 'reminder').map(convertToCalendarEvent),
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

// セレクター関数
export const eventSelectors = {
  getEvents: (state: EventStore) => state.events,
  getLoading: (state: EventStore) => state.loading,
  getError: (state: EventStore) => state.error,
  getFilters: (state: EventStore) => state.filters,
  getSelectedEventId: (state: EventStore) => state.selectedEventId,
  
  getSelectedEvent: (state: EventStore) => 
    state.selectedEventId ? state.events.find(e => e.id === state.selectedEventId) : null,
  
  getEventsByDate: (state: EventStore): EventsByDate => {
    const eventsByDate: EventsByDate = {}
    
    state.events.forEach(event => {
      if (!event.startDate) return
      const dateKey = formatDate(event.startDate)
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = []
      }
      
      const calendarEvent: CalendarEvent = {
        ...event,
        displayStartDate: event.startDate,
        displayEndDate: event.endDate || event.startDate,
        duration: event.endDate 
          ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))
          : 60,
        isMultiDay: event.endDate ? 
          formatDate(event.startDate) !== formatDate(event.endDate) : false,
        isRecurring: event.isRecurring || false,
      }
      
      eventsByDate[dateKey].push(calendarEvent)
    })
    
    // 日付内でソート
    Object.keys(eventsByDate).forEach(dateKey => {
      eventsByDate[dateKey].sort((a, b) => {
        const aTime = a.startDate?.getTime() || 0
        const bTime = b.startDate?.getTime() || 0
        return aTime - bTime
      })
    })
    
    return eventsByDate
  },
  
  getTodayEvents: (state: EventStore) => {
    const today = formatDate(new Date())
    const eventsByDate = eventSelectors.getEventsByDate(state)
    return eventsByDate[today] || []
  },
  
  getUpcomingEvents: (state: EventStore, days = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return state.events.filter(event => 
      event.startDate && event.startDate >= now && event.startDate <= futureDate
    ).sort((a, b) => {
      const aTime = a.startDate?.getTime() || 0
      const bTime = b.startDate?.getTime() || 0
      return aTime - bTime
    })
  },
}

// ストア初期化フラグ
let isInitialized = false

// ストア初期化関数をエクスポート
export const initializeEventStore = () => {
  if (!isBrowser || isInitialized) return
  
  console.log('🚀 Initializing event store from localStorage')
  isInitialized = true
  useEventStore.getState().fetchEvents()
}