'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useEventStore } from '../stores/useEventStore'

import type { EventFilters, Event } from '../types/events'

// 日付範囲フィルターのチェック
const checkDateRange = (event: Event, filters: EventFilters): boolean => {
  if (filters.startDate && event.startDate && event.startDate < filters.startDate) {
    return false
  }
  if (filters.endDate && event.endDate && event.endDate > filters.endDate) {
    return false
  }
  return true
}

// タイプとステータスフィルターのチェック
const checkTypeAndStatus = (event: Event, filters: EventFilters): boolean => {
  if (filters.types && filters.types.length > 0 && !filters.types.includes(event.type)) {
    return false
  }
  if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(event.status)) {
    return false
  }
  return true
}

// タグフィルターのチェック
const checkTags = (event: Event, filters: EventFilters): boolean => {
  if (filters.tagIds && filters.tagIds.length > 0) {
    const eventTagIds = event.tags?.map(tag => tag.id) || []
    if (!filters.tagIds.some(tagId => eventTagIds.includes(tagId))) {
      return false
    }
  }
  return true
}

// 検索クエリフィルターのチェック
const checkSearchQuery = (event: Event, filters: EventFilters): boolean => {
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    const titleMatch = event.title.toLowerCase().includes(query)
    const descriptionMatch = event.description?.toLowerCase().includes(query)
    if (!titleMatch && !descriptionMatch) {
      return false
    }
  }
  return true
}

// 共通イベントフィルター関数
const createEventFilter = (filters: EventFilters) => (event: Event): boolean => {
  return checkDateRange(event, filters) &&
         checkTypeAndStatus(event, filters) &&
         checkTags(event, filters) &&
         checkSearchQuery(event, filters)
}

/**
 * イベントデータ取得の最適化されたhook
 */
export function useEvents(filters?: EventFilters) {
  const { events, loading: _loading, error: _error, fetchEvents } = useEventStore()

  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
    initialData: events,
    select: (data) => {
      // フィルターが指定されている場合は適用
      if (!filters) return data
      
      return data.filter(createEventFilter(filters))
    }
  })
}

/**
 * 単一イベント取得
 */
export function useEvent(eventId: string) {
  const { getEvent } = useEventStore()

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId
  })
}

/**
 * 日付範囲でイベント取得
 */
export function useEventsByDateRange(startDate: Date, endDate: Date) {
  return useEvents({
    startDate,
    endDate
  })
}

/**
 * 特定の日付のイベント取得
 */
export function useEventsByDate(date: Date) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
  
  return useEventsByDateRange(startOfDay, endOfDay)
}

/**
 * イベント作成（簡易版）
 * @deprecated useCreateEventフックを使用してください
 */
export function useCreateEventSimple() {
  const queryClient = useQueryClient()
  const { createEvent } = useEventStore()

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    }
  })
}

/**
 * イベント更新
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const { updateEvent } = useEventStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: unknown }) => updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', id] })
    }
  })
}

/**
 * イベント削除
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { deleteEvent } = useEventStore()

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.removeQueries({ queryKey: ['event', eventId] })
    }
  })
}

/**
 * イベント統計
 */
export function useEventStats() {
  const { events } = useEventStore()

  return useQuery({
    queryKey: ['event-stats'],
    queryFn: () => {
      const stats = {
        total: events.length,
        byStatus: {
          inbox: 0,
          planned: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0
        },
        byType: {
          event: 0,
          task: 0,
          reminder: 0
        },
        byPriority: {
          urgent: 0,
          important: 0,
          necessary: 0,
          delegate: 0,
          optional: 0
        }
      }

      events.forEach(event => {
        stats.byStatus[event.status as keyof typeof stats.byStatus]++
        stats.byType[event.type as keyof typeof stats.byType]++
        if (event.priority) {
          stats.byPriority[event.priority as keyof typeof stats.byPriority]++
        }
      })

      return stats
    },
    initialData: {
      total: 0,
      byStatus: { inbox: 0, planned: 0, in_progress: 0, completed: 0, cancelled: 0 },
      byType: { event: 0, task: 0, reminder: 0 },
      byPriority: { urgent: 0, important: 0, necessary: 0, delegate: 0, optional: 0 }
    }
  })
}

/**
 * 複合フック: イベント管理全般
 */
export function useEventManagement(filters?: EventFilters) {
  const eventsQuery = useEvents(filters)
  const createMutation = useCreateEventSimple()
  const updateMutation = useUpdateEvent()
  const deleteMutation = useDeleteEvent()

  return {
    // データ
    events: eventsQuery.data || [],
    
    // 読み込み状態
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    
    // アクション
    createEvent: createMutation.mutate,
    updateEvent: updateMutation.mutate,
    deleteEvent: deleteMutation.mutate,
    
    // アクション状態
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // リフレッシュ
    refetch: eventsQuery.refetch
  }
}