import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CalendarEvent } from '@/features/calendar/types/calendar.types'

interface InspectorState {
  // Inspector State
  isInspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void

  // Width Control
  inspectorWidth: number
  setInspectorWidth: (width: number) => void

  // Resizable Settings
  minWidth: number
  maxWidth: number
  defaultWidth: number

  // Content Management
  activeContent: string | null
  setActiveContent: (content: string | null) => void

  // Event Management
  selectedEvent: CalendarEvent | null
  setSelectedEvent: (event: CalendarEvent | null) => void

  // Inspector resize methods
  setInspectorWidthConstrained: (width: number) => void
}

export const useInspectorStore = create<InspectorState>()(
  persist(
    (set, get) => ({
      // Inspector State
      isInspectorOpen: true, // テスト用: デフォルトで表示
      setInspectorOpen: (open) => set({ isInspectorOpen: open }),
      toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),

      // Width Control
      inspectorWidth: 320, // デフォルト幅
      setInspectorWidth: (width) => set({ inspectorWidth: width }),

      // Resizable Settings
      minWidth: 280,
      maxWidth: 600,
      defaultWidth: 320,

      // Content Management
      activeContent: 'calendar', // テスト用: カレンダーコンテンツ表示
      setActiveContent: (content) => set({ activeContent: content }),

      // Event Management
      selectedEvent: null,
      setSelectedEvent: (event) => set({ selectedEvent: event }),

      // Inspector resize with constraints
      setInspectorWidthConstrained: (width) => {
        const { minWidth, maxWidth } = get()
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, width))
        set({ inspectorWidth: constrainedWidth })
      },
    }),
    {
      name: 'inspector-store',
      partialize: (state) => ({
        isInspectorOpen: state.isInspectorOpen,
        inspectorWidth: state.inspectorWidth,
        activeContent: state.activeContent,
      }),
    }
  )
)
