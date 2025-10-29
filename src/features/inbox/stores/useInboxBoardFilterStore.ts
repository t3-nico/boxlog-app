import type { SessionStatus } from '@/features/tickets/types/session'
import type { TicketPriority, TicketStatus } from '@/features/tickets/types/ticket'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Inbox Board用フィルタ状態
 * Ticket/Session統合のため、両方の型を許容
 */
interface InboxBoardFilterState {
  status: Array<TicketStatus | SessionStatus>
  priority: TicketPriority[]
  tags: string[]
  search: string
  assignee: string
}

/**
 * Inbox Board用フィルタストア
 */
interface InboxBoardFilterStore extends InboxBoardFilterState {
  setStatus: (status: Array<TicketStatus | SessionStatus>) => void
  setPriority: (priority: TicketPriority[]) => void
  setTags: (tags: string[]) => void
  setSearch: (search: string) => void
  setAssignee: (assignee: string) => void
  reset: () => void
}

/**
 * 初期状態
 */
const initialState: InboxBoardFilterState = {
  status: [],
  priority: [],
  tags: [],
  search: '',
  assignee: '',
}

/**
 * Inbox Board用フィルタストア
 *
 * LocalStorageで永続化
 */
export const useInboxBoardFilterStore = create<InboxBoardFilterStore>()(
  persist(
    (set) => ({
      ...initialState,
      setStatus: (status) => set({ status }),
      setPriority: (priority) => set({ priority }),
      setTags: (tags) => set({ tags }),
      setSearch: (search) => set({ search }),
      setAssignee: (assignee) => set({ assignee }),
      reset: () => set(initialState),
    }),
    {
      name: 'inbox-board-filter',
    }
  )
)
