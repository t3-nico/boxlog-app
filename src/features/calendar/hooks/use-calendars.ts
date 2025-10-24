// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
import { useState } from 'react'

import { useMutation, useQuery } from '@tanstack/react-query'

// import { calendarService } from '../services/calendar-service' // Removed - using localStorage
import type {
  Calendar,
  CalendarShare,
  CalendarShareInput,
  CalendarViewState,
  CreateCalendarInput,
  UpdateCalendarInput,
} from '../types/calendar.types'

// クエリキー
export const calendarKeys = {
  all: ['calendars'] as const,
  lists: () => [...calendarKeys.all, 'list'] as const,
  list: (userId: string) => [...calendarKeys.lists(), { userId }] as const,
  details: () => [...calendarKeys.all, 'detail'] as const,
  detail: (id: string) => [...calendarKeys.details(), id] as const,
  shares: () => [...calendarKeys.all, 'shares'] as const,
  share: (calendarId: string) => [...calendarKeys.shares(), calendarId] as const,
  viewStates: () => [...calendarKeys.all, 'view-state'] as const,
  viewState: (userId: string) => [...calendarKeys.viewStates(), userId] as const,
}

// ========================================
// Calendar Management Hooks (localStorage-based)
// ========================================

export function useCalendars(userId: string) {
  // Calendar management tracked in Issue #87
  return useQuery({
    queryKey: calendarKeys.list(userId),
    queryFn: () => Promise.resolve([]), // Temporary stub
    enabled: !!userId,
  })
}

export function useCalendar(calendarId: string) {
  return useQuery({
    queryKey: calendarKeys.detail(calendarId),
    queryFn: () => Promise.resolve(null), // Temporary stub
    enabled: !!calendarId,
  })
}

export function useCreateCalendar(_userId: string) {
  return useMutation({
    mutationFn: (_input: CreateCalendarInput) => Promise.resolve({} as Calendar), // Temporary stub
  })
}

export function useUpdateCalendar() {
  return useMutation({
    mutationFn: ({ calendarId: _calendarId, input: _input }: { calendarId: string; input: UpdateCalendarInput }) =>
      Promise.resolve({} as Calendar), // Temporary stub
  })
}

export function useDeleteCalendar() {
  return useMutation({
    mutationFn: (_calendarId: string) => Promise.resolve(), // Temporary stub
  })
}

export function useSetDefaultCalendar() {
  return useMutation({
    mutationFn: (_calendarId: string) => Promise.resolve(), // Temporary stub
  })
}

// ========================================
// Calendar Sharing Hooks
// ========================================

export function useCalendarShares(calendarId: string) {
  return useQuery({
    queryKey: calendarKeys.share(calendarId),
    queryFn: () => Promise.resolve([]), // Temporary stub
    enabled: !!calendarId,
  })
}

export function useShareCalendar() {
  return useMutation({
    mutationFn: (_input: CalendarShareInput) => Promise.resolve({} as CalendarShare), // Temporary stub
    onSuccess: (_share) => {
      // queryClient.invalidateQueries({ queryKey: ['calendar-shares', share.calendarId] })
    },
  })
}

export function useUpdateCalendarShare() {
  return useMutation({
    mutationFn: ({
      shareId: _shareId,
      permission: _permission,
    }: {
      shareId: string
      permission: 'view' | 'edit' | 'admin'
    }) => Promise.resolve({} as CalendarShare), // Temporary stub
  })
}

export function useRevokeCalendarShare() {
  return useMutation({
    mutationFn: (_shareId: string) => Promise.resolve(), // Temporary stub
  })
}

export function useCreatePublicShareLink() {
  return useMutation({
    mutationFn: ({
      calendarId: _calendarId,
      permission: _permission,
      expiresInDays: _expiresInDays,
    }: {
      calendarId: string
      permission: 'view' | 'edit'
      expiresInDays?: number
    }) => Promise.resolve(''), // Temporary stub
  })
}

// ========================================
// View State Hooks
// ========================================

export function useCalendarViewState(userId: string) {
  return useQuery({
    queryKey: calendarKeys.viewState(userId),
    queryFn: () => Promise.resolve(null), // Temporary stub
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを維持
  })
}

export function useUpdateViewState(_userId: string) {
  return useMutation({
    mutationFn: (_updates: Partial<CalendarViewState>) => Promise.resolve({} as CalendarViewState), // Temporary stub
  })
}

// ========================================
// 複合Hooks（複数の機能を組み合わせ）
// ========================================

export function useCalendarManagement(userId: string) {
  const { data: calendars, isLoading: calendarsLoading } = useCalendars(userId)
  const { data: viewState, isLoading: viewStateLoading } = useCalendarViewState(userId)

  const createCalendar = useCreateCalendar(userId)
  const updateCalendar = useUpdateCalendar()
  const deleteCalendar = useDeleteCalendar()
  const setDefaultCalendar = useSetDefaultCalendar()
  const updateViewState = useUpdateViewState(userId)

  // デフォルトカレンダーを取得
  const defaultCalendar = calendars?.find((cal) => cal.isDefault)

  // 表示可能なカレンダーを取得
  const visibleCalendars = calendars?.filter((cal) => cal.isVisible) || []

  // 選択されたカレンダー（ビュー状態から）
  const selectedCalendarIds = viewState?.selectedCalendars || []
  const selectedCalendars = calendars?.filter((cal) => selectedCalendarIds.includes(cal.id)) || []

  return {
    // Data
    calendars,
    visibleCalendars,
    selectedCalendars,
    defaultCalendar,
    viewState,

    // Loading states
    isLoading: calendarsLoading || viewStateLoading,

    // Actions
    createCalendar: createCalendar.mutate,
    updateCalendar: updateCalendar.mutate,
    deleteCalendar: deleteCalendar.mutate,
    setDefaultCalendar: setDefaultCalendar.mutate,
    updateViewState: updateViewState.mutate,

    // Status
    isCreating: createCalendar.isPending,
    isUpdating: updateCalendar.isPending,
    isDeleting: deleteCalendar.isPending,
  }
}

// ========================================
// Local State Hooks（ローカル状態管理）
// ========================================

export function useCalendarSelection(initialCalendarIds: string[] = []) {
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>(initialCalendarIds)

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(calendarId) ? prev.filter((id) => id !== calendarId) : [...prev, calendarId]
    )
  }

  const selectAll = (calendarIds: string[]) => {
    setSelectedCalendarIds(calendarIds)
  }

  const deselectAll = () => {
    setSelectedCalendarIds([])
  }

  const isSelected = (calendarId: string) => {
    return selectedCalendarIds.includes(calendarId)
  }

  return {
    selectedCalendarIds,
    toggleCalendar,
    selectAll,
    deselectAll,
    isSelected,
    setSelectedCalendarIds,
  }
}

export function useCalendarColors() {
  const defaultColors = [
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
  ]

  const [customColors, setCustomColors] = useState<string[]>([])

  const addCustomColor = (color: string) => {
    if (!customColors.includes(color)) {
      setCustomColors((prev) => [...prev, color])
    }
  }

  const removeCustomColor = (color: string) => {
    setCustomColors((prev) => prev.filter((c) => c !== color))
  }

  const allColors = [...defaultColors, ...customColors]

  return {
    defaultColors,
    customColors,
    allColors,
    addCustomColor,
    removeCustomColor,
  }
}
