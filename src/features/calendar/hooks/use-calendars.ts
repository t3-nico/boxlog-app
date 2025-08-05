import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarService } from '../services/calendar-service'
import type {
  Calendar,
  CreateCalendarInput,
  UpdateCalendarInput,
  CalendarShare,
  CalendarShareInput,
  CalendarViewState
} from '../types/calendar.types'

// ========================================
// Calendar Management Hooks
// ========================================

export function useCalendars(userId: string) {
  return useQuery({
    queryKey: ['calendars', userId],
    queryFn: () => calendarService.getCalendars(userId),
    enabled: !!userId
  })
}

export function useCalendar(calendarId: string) {
  return useQuery({
    queryKey: ['calendar', calendarId],
    queryFn: () => calendarService.getCalendar(calendarId),
    enabled: !!calendarId
  })
}

export function useCreateCalendar(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCalendarInput) => 
      calendarService.createCalendar(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars', userId] })
    }
  })
}

export function useUpdateCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ calendarId, input }: { calendarId: string; input: UpdateCalendarInput }) =>
      calendarService.updateCalendar(calendarId, input),
    onSuccess: (calendar) => {
      queryClient.invalidateQueries({ queryKey: ['calendars', calendar.userId] })
      queryClient.invalidateQueries({ queryKey: ['calendar', calendar.id] })
    }
  })
}

export function useDeleteCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: calendarService.deleteCalendar,
    onSuccess: (_, calendarId) => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] })
      queryClient.removeQueries({ queryKey: ['calendar', calendarId] })
    }
  })
}

export function useSetDefaultCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: calendarService.setDefaultCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] })
    }
  })
}

// ========================================
// Calendar Sharing Hooks
// ========================================

export function useCalendarShares(calendarId: string) {
  return useQuery({
    queryKey: ['calendar-shares', calendarId],
    queryFn: () => calendarService.getCalendarShares(calendarId),
    enabled: !!calendarId
  })
}

export function useShareCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CalendarShareInput) =>
      calendarService.shareCalendar(input),
    onSuccess: (share) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-shares', share.calendarId] })
    }
  })
}

export function useUpdateCalendarShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ shareId, permission }: { shareId: string; permission: 'view' | 'edit' | 'admin' }) =>
      calendarService.updateCalendarShare(shareId, permission),
    onSuccess: (share) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-shares', share.calendarId] })
    }
  })
}

export function useRevokeCalendarShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: calendarService.revokeCalendarShare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-shares'] })
    }
  })
}

export function useCreatePublicShareLink() {
  return useMutation({
    mutationFn: ({ calendarId, permission, expiresInDays }: {
      calendarId: string
      permission: 'view' | 'edit'
      expiresInDays?: number
    }) => calendarService.createPublicShareLink(calendarId, permission, expiresInDays)
  })
}

// ========================================
// View State Hooks
// ========================================

export function useCalendarViewState(userId: string) {
  return useQuery({
    queryKey: ['calendar-view-state', userId],
    queryFn: () => calendarService.getViewState(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5 // 5分間はキャッシュを維持
  })
}

export function useUpdateViewState(userId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updates: Partial<CalendarViewState>) =>
      calendarService.updateViewState(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-view-state', userId] })
    }
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
  const defaultCalendar = calendars?.find(cal => cal.isDefault)
  
  // 表示可能なカレンダーを取得
  const visibleCalendars = calendars?.filter(cal => cal.isVisible) || []
  
  // 選択されたカレンダー（ビュー状態から）
  const selectedCalendarIds = viewState?.selectedCalendars || []
  const selectedCalendars = calendars?.filter(cal => 
    selectedCalendarIds.includes(cal.id)
  ) || []

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
    isDeleting: deleteCalendar.isPending
  }
}

// ========================================
// Local State Hooks（ローカル状態管理）
// ========================================

export function useCalendarSelection(initialCalendarIds: string[] = []) {
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>(initialCalendarIds)

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds(prev => 
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
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
    setSelectedCalendarIds
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
      setCustomColors(prev => [...prev, color])
    }
  }

  const removeCustomColor = (color: string) => {
    setCustomColors(prev => prev.filter(c => c !== color))
  }

  const allColors = [...defaultColors, ...customColors]

  return {
    defaultColors,
    customColors,
    allColors,
    addCustomColor,
    removeCustomColor
  }
}