'use client'

import { useState, useMemo } from 'react'
import type { EventFilters, Event, EventType, EventStatus } from '../types/events'

export function useEventFilters(initialFilters?: Partial<EventFilters>) {
  const [filters, setFilters] = useState<EventFilters>({
    startDate: undefined,
    endDate: undefined,
    types: undefined,
    statuses: undefined,
    tagIds: undefined,
    searchQuery: undefined,
    ...initialFilters
  })

  // フィルター適用関数
  const applyFilters = useMemo(() => {
    return (events: Event[]): Event[] => {
      return events.filter(event => {
        // 日付範囲フィルター
        if (filters.startDate && event.startDate) {
          if (event.startDate < filters.startDate) return false
        }
        if (filters.endDate && event.endDate) {
          if (event.endDate > filters.endDate) return false
        }

        // タイプフィルター
        if (filters.types && filters.types.length > 0) {
          if (!filters.types.includes(event.type)) return false
        }

        // ステータスフィルター
        if (filters.statuses && filters.statuses.length > 0) {
          if (!filters.statuses.includes(event.status)) return false
        }

        // タグフィルター
        if (filters.tagIds && filters.tagIds.length > 0) {
          const eventTagIds = event.tags?.map(tag => tag.id) || []
          if (!filters.tagIds.some(tagId => eventTagIds.includes(tagId))) {
            return false
          }
        }

        // 検索クエリフィルター
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          const titleMatch = event.title.toLowerCase().includes(query)
          const descriptionMatch = event.description?.toLowerCase().includes(query)
          if (!titleMatch && !descriptionMatch) return false
        }

        return true
      })
    }
  }, [filters])

  // フィルター更新関数群
  const updateFilters = (newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const setDateRange = (startDate: Date | undefined, endDate: Date | undefined) => {
    setFilters(prev => ({ ...prev, startDate, endDate }))
  }

  const setTypes = (types: EventType[] | undefined) => {
    setFilters(prev => ({ ...prev, types }))
  }

  const setStatuses = (statuses: EventStatus[] | undefined) => {
    setFilters(prev => ({ ...prev, statuses }))
  }

  const setTagIds = (tagIds: string[] | undefined) => {
    setFilters(prev => ({ ...prev, tagIds }))
  }

  const setSearchQuery = (searchQuery: string | undefined) => {
    setFilters(prev => ({ ...prev, searchQuery }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      types: undefined,
      statuses: undefined,
      tagIds: undefined,
      searchQuery: undefined
    })
  }

  // フィルターの有効性チェック
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.startDate ||
      filters.endDate ||
      (filters.types && filters.types.length > 0) ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.tagIds && filters.tagIds.length > 0) ||
      filters.searchQuery
    )
  }, [filters])

  return {
    filters,
    applyFilters,
    updateFilters,
    setDateRange,
    setTypes,
    setStatuses,
    setTagIds,
    setSearchQuery,
    clearFilters,
    hasActiveFilters
  }
}