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

  // 日付範囲フィルターチェック
  const passesDateRangeFilter = (event: Event): boolean => {
    if (filters.startDate && event.startDate && event.startDate < filters.startDate) {
      return false
    }
    if (filters.endDate && event.endDate && event.endDate > filters.endDate) {
      return false
    }
    return true
  }

  // タイプフィルターチェック
  const passesTypeFilter = (event: Event): boolean => {
    if (filters.types && filters.types.length > 0) {
      return filters.types.includes(event.type)
    }
    return true
  }

  // ステータスフィルターチェック
  const passesStatusFilter = (event: Event): boolean => {
    if (filters.statuses && filters.statuses.length > 0) {
      return filters.statuses.includes(event.status)
    }
    return true
  }

  // タグフィルターチェック
  const passesTagFilter = (event: Event): boolean => {
    if (filters.tagIds && filters.tagIds.length > 0) {
      const eventTagIds = event.tags?.map(tag => tag.id) || []
      return filters.tagIds.some(tagId => eventTagIds.includes(tagId))
    }
    return true
  }

  // 検索クエリフィルターチェック
  const passesSearchFilter = (event: Event): boolean => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const titleMatch = event.title.toLowerCase().includes(query)
      const descriptionMatch = event.description?.toLowerCase().includes(query)
      return titleMatch || descriptionMatch
    }
    return true
  }

  // 全フィルターチェック
  const passesAllFilters = (event: Event): boolean => {
    return (
      passesDateRangeFilter(event) &&
      passesTypeFilter(event) &&
      passesStatusFilter(event) &&
      passesTagFilter(event) &&
      passesSearchFilter(event)
    )
  }

  // フィルター適用関数
  const applyFilters = useMemo(() => {
    return (events: Event[]): Event[] => {
      return events.filter(passesAllFilters)
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