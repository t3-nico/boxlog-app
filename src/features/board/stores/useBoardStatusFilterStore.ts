import type { TicketStatus } from '@/features/tickets/types/ticket'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BoardStatusFilterState {
  visibleStatuses: Set<TicketStatus>
  toggleStatus: (status: TicketStatus) => void
  isStatusVisible: (status: TicketStatus) => boolean
  resetFilters: () => void
}

const defaultStatuses: TicketStatus[] = ['backlog', 'ready', 'active', 'wait', 'done', 'cancel']

/**
 * Boardのステータスフィルター管理用Store
 *
 * 表示/非表示のステータスを管理
 */
export const useBoardStatusFilterStore = create<BoardStatusFilterState>()(
  persist(
    (set, get) => ({
      visibleStatuses: new Set(defaultStatuses),

      toggleStatus: (status) => {
        set((state) => {
          const newVisibleStatuses = new Set(state.visibleStatuses)
          if (newVisibleStatuses.has(status)) {
            newVisibleStatuses.delete(status)
          } else {
            newVisibleStatuses.add(status)
          }
          return { visibleStatuses: newVisibleStatuses }
        })
      },

      isStatusVisible: (status) => {
        return get().visibleStatuses.has(status)
      },

      resetFilters: () => {
        set({ visibleStatuses: new Set(defaultStatuses) })
      },
    }),
    {
      name: 'board-status-filter-storage',
      partialize: (state) => ({
        visibleStatuses: Array.from(state.visibleStatuses),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { visibleStatuses?: TicketStatus[] }
        return {
          ...currentState,
          visibleStatuses: new Set(persisted.visibleStatuses || defaultStatuses),
        }
      },
    }
  )
)
