import type { SessionStatus } from '@/features/tickets/types/session'
import type { TicketPriority, TicketStatus } from '@/features/tickets/types/ticket'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Inbox Table用フィルタ状態
 * Ticket/Session統合のため、両方の型を許容
 */
interface InboxTableFilterState {
  status: Array<TicketStatus | SessionStatus>
  priority: TicketPriority[]
  tags: string[]
  search: string
}

/**
 * Inbox Table用フィルタストア
 */
interface InboxTableFilterStore extends InboxTableFilterState {
  setStatus: (status: Array<TicketStatus | SessionStatus>) => void
  setPriority: (priority: TicketPriority[]) => void
  setTags: (tags: string[]) => void
  setSearch: (search: string) => void
  reset: () => void
}

/**
 * 初期状態
 */
const initialState: InboxTableFilterState = {
  status: [],
  priority: [],
  tags: [],
  search: '',
}

/**
 * Inbox Table用フィルタストア
 *
 * LocalStorageで永続化
 */
export const useInboxTableFilterStore = create<InboxTableFilterStore>()(
  persist(
    (set) => ({
      ...initialState,
      setStatus: (status) => set({ status }),
      setPriority: (priority) => set({ priority }),
      setTags: (tags) => set({ tags }),
      setSearch: (search) => set({ search }),
      reset: () => set(initialState),
    }),
    {
      name: 'inbox-table-filter',
    }
  )
)
