import { create } from 'zustand'

import { useTagStore } from '@/features/tags/stores/tag-store'

import {
  Event,
  EventFilters,
  EventStore,
  CreateEventRequest,
  UpdateEventRequest,
  EventsByDate,
  CalendarEvent,
  EventType,
  EventStatus,
  EventPriority,
  RecurrencePattern,
  ChecklistItem,
  Reminder
} from '../types/events'

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
    
    // 直ちに確認
    const _saved = localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.error('💾 Save failed:', error)
  }
}

// LocalStorageに保存されたイベントデータの型定義
interface StoredEventData {
  id: string
  title: string
  description?: string
  startDate?: string | null
  endDate?: string | null
  type: EventType
  status: EventStatus
  priority?: EventPriority
  color: string
  isRecurring?: boolean
  recurrenceRule?: RecurrencePattern
  parentEventId?: string
  items?: ChecklistItem[]
  location?: string
  url?: string
  reminders?: Reminder[]
  tags?: Array<{
    id: string
    name: string
    color: string
    icon?: string
    parent_id?: string
  }>
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  isDeleted?: boolean
}

const loadFromLocalStorage = (): Event[] => {
  if (!isBrowser) return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored) as StoredEventData[]
    const events = parsed.map((event: StoredEventData) => ({
      ...event,
      startDate: event.startDate ? new Date(event.startDate) : null,
      endDate: event.endDate ? new Date(event.endDate) : null,
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
      deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
    }))

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

// 既存イベントからテストタグを削除する関数
const cleanExistingEvents = (): Event[] => {
  const events = loadFromLocalStorage()
  
  // 既存イベントからテストタグ（会議、作業）を削除
  const cleanedEvents = events.map(event => ({
    ...event,
    tags: [] // すべてのタグをクリア
  }))
  
  // クリーンなイベントを保存
  if (cleanedEvents.length > 0) {
    saveToLocalStorage(cleanedEvents)
  }
  
  return cleanedEvents
}

export const useEventStore = create<EventStore>()((set, get) => ({
  // 初期状態 - タグをクリーンアップしてから読み込む
  events: cleanExistingEvents(),
  loading: false,
  error: null,
  filters: {},
  selectedEventId: null,
  lastFetchedRange: null,

  // イベント取得（必要に応じてフィルタリング）
  fetchEvents: async (_filters?: EventFilters) => {
    set({ loading: true })
    
    try {
      // ローカルストレージから読み込み
      const events = loadFromLocalStorage()
      
      set({ 
        events, 
        loading: false,
        error: null 
      })
    } catch (error) {
      console.error('❌ Fetch events failed:', error)
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events'
      })
    }
  },

  // イベント作成
  createEvent: async (eventData: CreateEventRequest) => {
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
        tags: eventData.tagIds ? useTagStore.getState().getTagsByIds(eventData.tagIds) : [],  // tagIdsからタグ情報を取得
        createdAt: new Date(),
        updatedAt: new Date(),
        type: eventData.type || 'event',  // typeフィールドを正しく設定
        isDeleted: false,
        deletedAt: null
      }
      
      const currentEvents = get().events
      const newEvents = [...currentEvents, newEvent]
      
      // ストアを更新
      set({ 
        events: newEvents, 
        loading: false 
      })
      
      // ローカルストレージに保存
      saveToLocalStorage(newEvents)
      
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
    set({ loading: true, error: null })
    
    try {
      const currentEvents = get().events
      const updatedEvents = currentEvents.map(event => {
        if (event.id === eventData.id) {
          const updatedEvent = { ...event, ...eventData, updatedAt: new Date() }
          // tagIdsが提供されている場合は、タグ情報を解決
          if (eventData.tagIds) {
            updatedEvent.tags = useTagStore.getState().getTagsByIds(eventData.tagIds)
          }
          return updatedEvent
        }
        return event
      })
      
      set({ 
        events: updatedEvents, 
        loading: false 
      })
      
      saveToLocalStorage(updatedEvents)
      
      const updatedEvent = updatedEvents.find(e => e.id === eventData.id)
      
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

  // イベント時間更新（ドラッグ&ドロップ用）
  updateEventTime: async (eventId: string, startTime: Date, endTime: Date) => {
    try {
      return await get().updateEvent({
        id: eventId,
        startDate: startTime,
        endDate: endTime
      })
    } catch (error) {
      console.error('❌ Update event time failed:', error)
      throw error
    }
  },

  // イベント削除（後方互換性のため残す - 内部でsoftDeleteEventを呼ぶ）
  deleteEvent: async (eventId: string) => {
    return get().softDeleteEvent(eventId)
  },
  
  // 論理削除（ソフトデリート）- 統一ゴミ箱連携
  softDeleteEvent: async (eventId: string) => {
    set({ loading: true, error: null })
    
    try {
      const currentEvents = get().events
      const eventToDelete = currentEvents.find(event => event.id === eventId)
      
      if (!eventToDelete) {
        throw new Error(`Event with ID ${eventId} not found`)
      }

      // 統一ゴミ箱にアイテムを追加
      const { useTrashStore } = await import('@/features/trash/stores/useTrashStore')
      await useTrashStore.getState().addItem({
        id: eventId,
        type: 'event',
        title: eventToDelete.title,
        description: eventToDelete.description,
        deletedFrom: '/calendar',
        originalData: eventToDelete,
        metadata: {
          color: eventToDelete.color,
          tags: eventToDelete.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [],
          subtitle: eventToDelete.startDate ? eventToDelete.startDate.toLocaleDateString() : undefined,
          priority: eventToDelete.priority === 'urgent' ? 'high' : eventToDelete.priority === 'important' ? 'medium' : 'low'
        }
      })

      // eventsから削除（物理削除）
      const updatedEvents = currentEvents.filter(event => event.id !== eventId)
      
      set({ 
        events: updatedEvents,
        selectedEventId: get().selectedEventId === eventId ? null : get().selectedEventId,
        loading: false 
      })
      
      saveToLocalStorage(updatedEvents)
      console.log('✅ Event moved to unified trash:', {
        title: eventToDelete.title,
        id: eventToDelete.id,
        startDate: eventToDelete.startDate,
        endDate: eventToDelete.endDate
      })
    } catch (error) {
      console.error('❌ Soft delete event failed:', error)
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete event'
      })
      throw error
    }
  },
  
  // イベント復元（統一ゴミ箱から復元される際に使用）
  restoreEvent: async (eventData: Event) => {
    set({ loading: true, error: null })
    
    try {
      const currentEvents = get().events
      
      // 既に存在するイベントかチェック
      const existingEvent = currentEvents.find(event => event.id === eventData.id)
      if (existingEvent) {
        console.log('Event already exists, skipping restore:', eventData.id)
        set({ loading: false })
        return
      }
      
      // イベントを復元（日付データを適切に変換）
      const restoredEvent = {
        ...eventData,
        startDate: eventData.startDate ? (eventData.startDate instanceof Date ? eventData.startDate : new Date(eventData.startDate)) : null,
        endDate: eventData.endDate ? (eventData.endDate instanceof Date ? eventData.endDate : new Date(eventData.endDate)) : null,
        createdAt: eventData.createdAt ? (eventData.createdAt instanceof Date ? eventData.createdAt : new Date(eventData.createdAt)) : new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isDeleted: false
      }
      
      const updatedEvents = [...currentEvents, restoredEvent]
      
      set({ 
        events: updatedEvents,
        loading: false 
      })
      
      saveToLocalStorage(updatedEvents)
      console.log('✅ Event restored to calendar:', {
        title: restoredEvent.title,
        id: restoredEvent.id,
        originalStartDate: eventData.startDate,
        originalEndDate: eventData.endDate,
        restoredStartDate: restoredEvent.startDate,
        restoredEndDate: restoredEvent.endDate
      })
    } catch (error) {
      console.error('❌ Restore event failed:', error)
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to restore event'
      })
      throw error
    }
  },
  
  // 物理削除（統一ゴミ箱システムが管理するため、通常は使用されない）
  hardDeleteEvent: async (_eventId: string) => {
    console.log('hardDeleteEvent called - unified trash system manages permanent deletion')
  },
  
  // バッチ論理削除 - 統一ゴミ箱連携
  batchSoftDelete: async (eventIds: string[]) => {
    set({ loading: true, error: null })
    
    try {
      const currentEvents = get().events
      const eventsToDelete = currentEvents.filter(event => eventIds.includes(event.id))
      
      if (eventsToDelete.length === 0) {
        set({ loading: false })
        return
      }

      // 統一ゴミ箱にアイテムを一括追加
      const { useTrashStore } = await import('@/features/trash/stores/useTrashStore')
      const trashItems = eventsToDelete.map(event => ({
        id: event.id,
        type: 'event' as const,
        title: event.title,
        description: event.description,
        deletedFrom: '/calendar',
        originalData: event,
        metadata: {
          color: event.color,
          tags: event.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [],
          subtitle: event.startDate ? event.startDate.toLocaleDateString() : undefined,
          priority: event.priority === 'urgent' ? 'high' as const : event.priority === 'important' ? 'medium' as const : 'low' as const
        }
      }))

      await useTrashStore.getState().addItems(trashItems)

      // eventsから削除（物理削除）
      const updatedEvents = currentEvents.filter(event => !eventIds.includes(event.id))
      
      set({ 
        events: updatedEvents,
        selectedEventId: eventIds.includes(get().selectedEventId || '') ? null : get().selectedEventId,
        loading: false 
      })
      
      saveToLocalStorage(updatedEvents)
      console.log('✅ Events moved to unified trash:', eventsToDelete.length, 'events')
    } catch (error) {
      console.error('❌ Batch soft delete failed:', error)
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete events'
      })
      throw error
    }
  },
  
  // バッチ復元（統一ゴミ箱システムが管理）
  batchRestore: async (_eventIds: string[]) => {
    console.log('batchRestore called - unified trash system manages restoration')
  },
  
  // バッチ物理削除（統一ゴミ箱システムが管理）
  batchHardDelete: async (_eventIds: string[]) => {
    console.log('batchHardDelete called - unified trash system manages permanent deletion')
  },
  
  // ゴミ箱をクリア（統一ゴミ箱システムが管理）
  clearTrash: async () => {
    console.log('clearTrash called - unified trash system manages this operation')
  },
  
  // ゴミ箱内のイベントを取得（統一ゴミ箱から取得）
  getTrashedEvents: () => {
    console.log('getTrashedEvents called - use unified trash system instead')
    return []
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
    
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    
    const filteredEvents = events.filter(event => {
      // 削除済みイベントは除外
      if (event.isDeleted) return false
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
    
    return filteredEvents
  },

  getEventsGroupedByType: () => {
    const { events } = get()
    // 削除済みイベントを除外
    const activeEvents = events.filter(event => !event.isDeleted)
    
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
      events: activeEvents.filter(e => e.type === 'event').map(convertToCalendarEvent),
      tasks: activeEvents.filter(e => e.type === 'task').map(convertToCalendarEvent),
      reminders: activeEvents.filter(e => e.type === 'reminder').map(convertToCalendarEvent),
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
    
    // 削除済みイベントを除外
    const activeEvents = state.events.filter(event => !event.isDeleted)
    
    activeEvents.forEach(event => {
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
  
  isInitialized = true
  useEventStore.getState().fetchEvents()
}