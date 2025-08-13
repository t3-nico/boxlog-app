'use client'

import { create } from 'zustand'
import { useCallback } from 'react'
import { CreateContextData } from '@/features/calendar/components/add-popup/AddPopup'

type TabType = 'event' | 'log'

interface AddPopupStore {
  // State
  isOpen: boolean
  activeTab: TabType
  contextData: CreateContextData | null
  
  // Actions
  openPopup: (tab?: TabType, context?: CreateContextData | null) => void
  closePopup: () => void
  setActiveTab: (tab: TabType) => void
  setContextData: (context: CreateContextData | null) => void
}

export const useAddPopupStore = create<AddPopupStore>((set, get) => ({
  // Initial state
  isOpen: false,
  activeTab: 'event',
  contextData: null,

  // Actions
  openPopup: (tab = 'event', context: CreateContextData | null = null) => {
    
    // Smart tab selection based on context
    let selectedTab = tab
    if (context && !tab) {
      // If context suggests completed work, default to log tab
      if (context.status === 'Done') {
        selectedTab = 'log'
      }
      // If due date is in the past, suggest log tab
      else if (context.dueDate && context.dueDate < new Date()) {
        selectedTab = 'log'
      }
      // Default to event for future planning
      else {
        selectedTab = 'event'
      }
    }

    
    set({
      isOpen: true,
      activeTab: selectedTab,
      contextData: context,
    })
    
  },

  closePopup: () => {
    set({
      isOpen: false,
      contextData: null,
    })
  },

  setActiveTab: (tab: TabType) => {
    set({ activeTab: tab })
  },

  setContextData: (context: CreateContextData | null) => {
    set({ contextData: context })
  },
}))

// Hook for easier component usage
export const useAddPopup = () => {
  const store = useAddPopupStore()
  
  // useCallbackでメモ化して毎回新しい関数が作成されるのを防ぐ
  const openEventPopup = useCallback((context?: CreateContextData | null) => {
    store.openPopup('event', context)
  }, [store.openPopup])
  
  const openLogPopup = useCallback((context?: CreateContextData | null) => {
    store.openPopup('log', context)
  }, [store.openPopup])
  
  return {
    // State
    isOpen: store.isOpen,
    activeTab: store.activeTab,
    contextData: store.contextData,
    
    // Actions
    openPopup: store.openPopup,
    closePopup: store.closePopup,
    setActiveTab: store.setActiveTab,
    setContextData: store.setContextData,
    
    // Convenience methods (メモ化済み)
    openEventPopup,
    openLogPopup,
  }
}

// Hook for keyboard shortcuts
export const useAddPopupKeyboardShortcuts = () => {
  const { openPopup } = useAddPopup()

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl+N or Cmd+N - Open add popup
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault()
      openPopup('event')
    }
    
    // Ctrl+Shift+N or Cmd+Shift+N - Open log popup
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
      event.preventDefault()
      openPopup('log')
    }
  }

  return { handleKeyDown }
}

// Hook for context-aware popup opening
export const useContextAwarePopup = () => {
  const { openPopup } = useAddPopup()

  const openFromCalendar = (selectedDate?: Date) => {
    const context: CreateContextData = {
      dueDate: selectedDate || new Date(),
      status: 'Todo',
    }
    openPopup(undefined, context) // Let smart selection choose tab
  }

  const openFromBoard = (columnStatus: string) => {
    const context: CreateContextData = {
      status: columnStatus as any,
    }
    openPopup(undefined, context) // Let smart selection choose tab
  }

  const openFromTable = (filters?: { tags?: string[], priority?: string }) => {
    const context: CreateContextData = {
      tags: filters?.tags,
      priority: filters?.priority as any,
    }
    openPopup('event', context) // Default to event for table view
  }

  return {
    openFromCalendar,
    openFromBoard,
    openFromTable,
  }
}