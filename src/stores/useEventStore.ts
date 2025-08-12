import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Event, 
  EventEntity, 
  EventFilters, 
  EventStore,
  CreateEventRequest,
  UpdateEventRequest,
  EventsByDate,
  EventsGroupedByType,
  CalendarEvent
} from '@/types/events'
import { localToUTC, dateToLocalStrings } from '@/utils/dateHelpers'
import { normalizePostgresDate } from '@/utils/postgresDateNormalizer'

// Utility functions
const convertEntityToEvent = (entity: EventEntity): Event => {
  // console.log('🔄 Converting entity to event:', { id: entity.id, title: entity.title, planned_start: entity.planned_start })
  // planned_startとplanned_endを使用
  let startDate: Date | undefined
  let endDate: Date | undefined
  
  // 🔧 PostgreSQL日時形式を正規化して処理
  const normalizedStart = normalizePostgresDate(entity.planned_start, 'planned_start')
  const normalizedEnd = normalizePostgresDate(entity.planned_end, 'planned_end')
  
  if (normalizedStart) {
    startDate = normalizedStart
    console.log('✅ Normalized start date:', {
      original: entity.planned_start,
      normalized: startDate,
      iso: startDate.toISOString(),
      local: startDate.toLocaleString('ja-JP')
    })
  } else if (entity.planned_start) {
    console.warn('⚠️ Failed to normalize planned_start:', entity.planned_start)
  }
  
  if (normalizedEnd) {
    endDate = normalizedEnd
  }

  // Convert tag data from entity format
  const tags: any[] = entity.event_tags?.map(eventTag => eventTag.tags).filter(Boolean) || []

  const event = {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    startDate,
    endDate,
    status: entity.status,
    priority: entity.priority,
    color: entity.color,
    isRecurring: entity.is_recurring,
    recurrenceRule: entity.recurrence_rule,
    items: entity.items || [],
    location: entity.location,
    url: entity.url,
    tags,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
    type: 'event' as any,
    // ゴミ箱機能のフィールドを追加
    isDeleted: (entity as any).is_deleted || false,
    deletedAt: (entity as any).deleted_at ? new Date((entity as any).deleted_at) : null
  }
  
  return event
}

const convertEventToCreateRequest = (event: Partial<Event>): CreateEventRequest => {
  return {
    title: event.title || '',
    description: event.description,
    startDate: event.startDate!,
    endDate: event.endDate,
    type: event.type,
    status: event.status,
    color: event.color,
    location: event.location,
    url: event.url,
    tagIds: event.tags?.map(tag => tag.id),
  }
}

const formatDateForAPI = (date: Date): string => {
  // Googleカレンダー互換: ローカル日付をYYYY-MM-DD形式に変換（タイムゾーン安全）
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTimeForAPI = (date: Date): string => {
  return date.toTimeString().split(' ')[0] // HH:MM:SS
}

// 一度だけ実行されるクリーンアップ処理
const cleanupOldTestEvents = () => {
  if (typeof window === 'undefined') return
  
  const cleanupKey = 'event-store-cleaned-v3'
  const hasBeenCleaned = localStorage.getItem(cleanupKey)
  
  if (!hasBeenCleaned) {
    // 古いテスト用localStorageデータを完全削除
    console.log('🧹 Before cleanup - localStorage data:', localStorage.getItem('event-store'))
    localStorage.removeItem('event-store')
    localStorage.setItem(cleanupKey, 'true')
    console.log('🧹 After cleanup - localStorage data:', localStorage.getItem('event-store'))
    console.log('🧹 Cleaned old test events from localStorage')
  } else {
    console.log('🧹 Cleanup already performed')
  }
}

// クリーンアップを実行
cleanupOldTestEvents()

// Initial state - テスト予定を削除してクリーンな状態から開始
const initialState = {
  events: [], // 空の配列から開始
  loading: false,
  error: null,
  filters: {},
  selectedEventId: null,
  lastFetchedRange: null as { start: string; end: string } | null,
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Event CRUD operations
      fetchEvents: async (filters?: EventFilters) => {
        // キャッシュ機構を一時的に無効化
        console.log('🌐 [CACHE DISABLED] fetchEvents called')
        
        set({ loading: true, error: null })
        
        try {
          const params = new URLSearchParams()
          
          if (filters?.startDate) {
            params.append('start_date', formatDateForAPI(filters.startDate))
          }
          if (filters?.endDate) {
            params.append('end_date', formatDateForAPI(filters.endDate))
          }
          if (filters?.types?.length) {
            filters.types.forEach(type => params.append('event_type', type))
          }
          if (filters?.statuses?.length) {
            filters.statuses.forEach(status => params.append('status', status))
          }
          if (filters?.tagIds?.length) {
            params.append('tag_ids', filters.tagIds.join(','))
          }
          if (filters?.searchQuery) {
            params.append('search', filters.searchQuery)
          }

          console.log('🌐 Making API request:', `/api/events?${params.toString()}`)
          const response = await fetch(`/api/events?${params.toString()}`)
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to fetch events: ${response.status} ${errorText}`)
          }

          const data = await response.json()
          const events = (data.data?.events || data.events || [])
            .map((entity: EventEntity) => convertEntityToEvent(entity))
            .filter((event: Event) => {
              // startDateが無効なイベントを除外
              return event.startDate !== undefined
            })
          set({ events, loading: false, filters: filters || {} })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
        }
      },

      createEvent: async (eventData: CreateEventRequest) => {
        set({ loading: true, error: null })
        
        try {
          // 🚧 ローカルテスト用: API呼び出しをスキップ
          const LOCAL_TEST_MODE = true // 後でfalseにしてSupabase連携を有効化
          
          if (LOCAL_TEST_MODE) {
            const newEvent = {
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
            
            set(state => ({
              events: [...state.events, newEvent],
              loading: false
            }))
            
            return newEvent
          }
          // Convert dates to appropriate format for new API
          // 更新時は直接ローカル時間を取得（UTC変換を避ける）
          const getDateFromEvent = (date: Date | string | undefined): string | undefined => {
            if (!date) return undefined
            if (typeof date === 'string') return date
            // ローカル時間で日付を取得
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          
          const getTimeFromEvent = (date: Date | string | undefined): string | undefined => {
            if (!date) return undefined
            if (typeof date === 'string') return date
            // ローカル時間で時間を取得
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${hours}:${minutes}`
          }

          const apiData = {
            title: eventData.title,
            description: eventData.description,
            date: getDateFromEvent(eventData.startDate),
            startTime: getTimeFromEvent(eventData.startDate),
            endTime: getTimeFromEvent(eventData.endDate),
            status: eventData.status || 'inbox',
            priority: eventData.priority,
            color: eventData.color || '#3b82f6',
            isRecurring: eventData.isRecurring || false,
            recurrenceType: eventData.recurrenceRule?.type,
            recurrenceInterval: eventData.recurrenceRule?.interval,
            recurrenceEndDate: eventData.recurrenceRule?.endDate,
            items: eventData.items || [],
            location: eventData.location,
            url: eventData.url,
            tagIds: eventData.tagIds || [],
          }

          const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create event')
          }

          const responseData = await response.json()
          const entity = responseData.data || responseData // APIレスポンス形式に対応
          const newEvent = convertEntityToEvent(entity)

          // 有効なstartDateがある場合のみ追加
          if (newEvent.startDate) {
            console.log('✅ Adding new event to store:', {
              id: newEvent.id,
              title: newEvent.title,
              startDate: newEvent.startDate,
              startDateISO: newEvent.startDate.toISOString()
            })
            set(state => {
              const newEvents = [...state.events, newEvent]
              console.log('📊 Store events count after addition:', newEvents.length)
              return {
                events: newEvents,  
                loading: false,
              }
            })
          } else {
            console.error('❌ Event creation failed: Invalid date', newEvent)
            throw new Error('Event creation failed: Invalid date')
          }

          return newEvent
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
          throw error
        }
      },

      updateEvent: async (eventData: UpdateEventRequest) => {
        set({ loading: true, error: null })
        
        try {
          // 🕐 date-fns-tz: タイムゾーン安全な日時変換
          const getDateTimeFromEvent = (date: Date | string | undefined): { date?: string; time?: string } => {
            if (!date) return {}
            if (typeof date === 'string') return { date: date } // 既に文字列の場合
            
            // Dateオブジェクトをローカル文字列に変換
            const { date: dateStr, time: timeStr } = dateToLocalStrings(date)
            return { date: dateStr, time: timeStr }
          }

          const startDateTime = getDateTimeFromEvent(eventData.startDate)
          const endDateTime = getDateTimeFromEvent(eventData.endDate)

          const apiData = {
            title: eventData.title,
            description: eventData.description,
            date: startDateTime.date,
            startTime: startDateTime.time,
            endTime: endDateTime.time,
            status: eventData.status,
            priority: eventData.priority,
            color: eventData.color,
            isRecurring: eventData.isRecurring || false,
            recurrenceType: eventData.recurrenceRule?.type,
            recurrenceInterval: eventData.recurrenceRule?.interval,
            recurrenceEndDate: eventData.recurrenceRule?.endDate,
            location: eventData.location,
            url: eventData.url,
            tagIds: eventData.tagIds || [],
            // ゴミ箱機能のフィールドを追加
            isDeleted: eventData.isDeleted,
            deletedAt: eventData.deletedAt?.toISOString(),
          }

          console.log('🕐 date-fns-tz UPDATE API: Sending PUT request with data:', apiData)
          console.log('🗑️ EventStore: isDeleted =', eventData.isDeleted, 'deletedAt =', eventData.deletedAt)
          
          // 🚧 ローカルテスト用: API呼び出しをスキップしてローカルのみ更新
          const LOCAL_TEST_MODE = true // 後でfalseにしてSupabase連携を有効化
          
          if (LOCAL_TEST_MODE) {
            const { events } = get()
            const updatedEvents = events.map(e => {
              if (e.id === eventData.id) {
                return {
                  ...e,
                  ...eventData,
                  updatedAt: new Date()
                }
              }
              return e
            })
            set({ events: updatedEvents, loading: false })
            return updatedEvents.find(e => e.id === eventData.id)!
          }
          console.log('🕐 date-fns-tz UPDATE API: Converting dates:', {
            originalStartDate: eventData.startDate?.toISOString(),
            convertedDate: apiData.date,
            convertedStartTime: apiData.startTime,
            convertedEndTime: apiData.endTime
          })

          const response = await fetch(`/api/events/${eventData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('API error response:', errorData)
            throw new Error(errorData.error?.message || errorData.message || 'Failed to update event')
          }

          const responseData = await response.json()
          console.log('API response:', responseData)
          const entity = responseData.data || responseData
          console.log('Entity after extraction:', entity)
          const updatedEvent = convertEntityToEvent(entity)
          console.log('Converted event:', updatedEvent)

          // 更新されたイベントが有効なstartDateを持つ場合のみ更新
          if (updatedEvent.startDate) {
            console.log('🔄 Updating event store state...')
            console.log('📊 Before update - store events:', get().events.length)
            console.log('📊 Event to update:', { id: eventData.id, title: updatedEvent.title, startDate: updatedEvent.startDate })
            
            set(state => {
              const oldEvent = state.events.find(e => e.id === eventData.id)
              console.log('📊 Found existing event:', oldEvent ? 'YES' : 'NO')
              
              const newEvents = state.events.map(event => 
                event.id === eventData.id ? updatedEvent : event
              )
              console.log('📊 After update - events array length:', newEvents.length)
              
              const updatedInArray = newEvents.find(e => e.id === eventData.id)
              console.log('📊 Updated event in array:', updatedInArray ? 'FOUND' : 'NOT FOUND')
              console.log('📊 Updated event details:', updatedInArray)
              
              return {
                events: newEvents,
                loading: false,
              }
            })
          } else {
            console.error('❌ Updated event has no startDate:', updatedEvent)
            console.error('❌ Original API response entity:', entity)
            throw new Error('Updated event has invalid date')
          }

          return updatedEvent
        } catch (error) {
          console.error('UpdateEvent error:', error)
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
          throw error
        }
      },

      deleteEvent: async (eventId: string) => {
        set({ loading: true, error: null })
        
        try {
          // 🚧 ローカルテスト用: API呼び出しをスキップ
          const LOCAL_TEST_MODE = true // 後でfalseにしてSupabase連携を有効化
          
          if (LOCAL_TEST_MODE) {
            console.log('🚧 LOCAL TEST MODE: Permanently deleting event from local store:', eventId)
            set(state => ({
              events: state.events.filter(event => event.id !== eventId),
              selectedEventId: state.selectedEventId === eventId ? null : state.selectedEventId,
              loading: false,
            }))
            return
          }
          
          const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to delete event')
          }

          set(state => ({
            events: state.events.filter(event => event.id !== eventId),
            selectedEventId: state.selectedEventId === eventId ? null : state.selectedEventId,
            loading: false,
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            loading: false 
          })
          throw error
        }
      },

      // Event selection and filtering
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

      // Utility actions
      getEventsByDateRange: (startDate: Date, endDate: Date) => {
        const { events } = get()
        console.log('📅 getEventsByDateRange called with:', { startDate, endDate, totalEvents: events.length })
        
        // 日付範囲を年月日のみで比較するため、時刻をリセット
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        
        const filteredEvents = events.filter(event => {
          // startDateがない場合はフィルタリングから除外
          if (!event.startDate) {
            console.log('❌ Event has no startDate:', event.id, event.title)
            return false
          }
          
          // イベントの日付も年月日のみで比較
          const eventStartDateOnly = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate())
          let eventEndDateOnly = eventStartDateOnly
          if (event.endDate) {
            eventEndDateOnly = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate())
          }
          
          const inRange = (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
                         (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
                         (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
          
          if (inRange) {
            console.log('✅ Event in range:', event.id, event.title, `${event.startDate.toDateString()} ${event.startDate.toTimeString().substring(0, 8)}`)
          } else {
            console.log('❌ Event NOT in range:', event.id, event.title, `${event.startDate.toDateString()} ${event.startDate.toTimeString().substring(0, 8)}`)
          }
          
          return inRange
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
            : 60, // Default to 1 hour for timed events
          isMultiDay: event.endDate && event.startDate ? 
            formatDateForAPI(event.startDate) !== formatDateForAPI(event.endDate) : false,
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
    }),
    {
      name: 'event-store',
      partialize: (state) => ({
        filters: state.filters,
        selectedEventId: state.selectedEventId,
        events: state.events, // 🚧 ローカルテスト用: イベントをlocalStorageに保存
      }),
      // Date型のシリアライゼーション/デシリアライゼーション
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          events: state.events?.map(event => ({
            ...event,
            startDate: event.startDate?.toISOString(),
            endDate: event.endDate?.toISOString(),
            createdAt: event.createdAt?.toISOString(),
            updatedAt: event.updatedAt?.toISOString(),
            deletedAt: event.deletedAt?.toISOString(),
          }))
        })
      },
      deserialize: (str) => {
        const state = JSON.parse(str)
        const deserializedEvents = state.events?.map((event: any) => {
          // 古い形式のイベントを新しい形式に変換
          if (event.date && event.startTime && !event.startDate) {
            console.log('🔄 Converting old format event:', event.title)
            
            // date + startTime を startDate に変換
            const [year, month, day] = event.date.split('-').map(Number)
            const [hours, minutes] = event.startTime.split(':').map(Number)
            const startDate = new Date(year, month - 1, day, hours, minutes)
            
            // endTime があれば endDate に変換
            let endDate = null
            if (event.endTime) {
              const [endHours, endMinutes] = event.endTime.split(':').map(Number)
              endDate = new Date(year, month - 1, day, endHours, endMinutes)
              
              // 終了時間が開始時間より早い場合は翌日扱い
              if (endDate <= startDate) {
                endDate.setDate(endDate.getDate() + 1)
              }
            }
            
            return {
              id: event.id,
              title: event.title,
              description: event.description || '',
              startDate: startDate,
              endDate: endDate,
              status: event.status || 'inbox',
              priority: event.priority,
              color: event.color || '#3b82f6',
              isRecurring: event.isRecurring || false,
              recurrenceRule: event.recurrenceRule,
              items: event.items || [],
              location: event.location,
              url: event.url,
              reminders: event.reminders || [],
              tags: event.tags || [],
              createdAt: new Date(),
              updatedAt: new Date(),
              type: 'event',
              isDeleted: false,
              deletedAt: null
            }
          }
          
          // 新しい形式のイベントは通常通り変換
          return {
            ...event,
            startDate: event.startDate ? new Date(event.startDate) : null,
            endDate: event.endDate ? new Date(event.endDate) : null,
            createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
            updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
            deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
          }
        }) || []
        
        return {
          ...state,
          events: deserializedEvents
        }
      },
    }
  )
)

// Selector functions for performance optimization
export const eventSelectors = {
  // Basic selectors
  getEvents: (state: EventStore) => state.events,
  getLoading: (state: EventStore) => state.loading,
  getError: (state: EventStore) => state.error,
  getFilters: (state: EventStore) => state.filters,
  getSelectedEventId: (state: EventStore) => state.selectedEventId,
  
  // Computed selectors
  getSelectedEvent: (state: EventStore) => 
    state.selectedEventId ? state.events.find(e => e.id === state.selectedEventId) : null,
  
  getEventsByDate: (state: EventStore): EventsByDate => {
    const eventsByDate: EventsByDate = {}
    
    state.events.forEach(event => {
      if (!event.startDate) return
      const dateKey = formatDateForAPI(event.startDate)
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = []
      }
      
      // Convert to CalendarEvent
      const calendarEvent: CalendarEvent = {
        ...event,
        displayStartDate: event.startDate,
        displayEndDate: event.endDate || event.startDate,
        duration: event.endDate 
          ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60))
          : 60, // Default to 1 hour for timed events // Default to 1 hour for timed events, full day for all-day
        isMultiDay: event.endDate ? 
          formatDateForAPI(event.startDate) !== formatDateForAPI(event.endDate) : false,
        isRecurring: event.isRecurring || false,
      }
      
      eventsByDate[dateKey].push(calendarEvent)
    })
    
    // Sort events within each date
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
    const today = formatDateForAPI(new Date())
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