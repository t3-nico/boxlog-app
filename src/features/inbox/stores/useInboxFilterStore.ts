import type { TicketPriority, TicketStatus } from '@/features/tickets/types/ticket'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Inbox共通フィルタ状態
 * Board/Table両方で共有するフィルター
 */
interface InboxFilterState {
  status: TicketStatus[]
  priority: TicketPriority[]
  tags: string[]
  search: string
  assignee: string
}

/**
 * Inbox共通フィルタストア
 */
interface InboxFilterStore extends InboxFilterState {
  setStatus: (status: TicketStatus[]) => void
  setPriority: (priority: TicketPriority[]) => void
  setTags: (tags: string[]) => void
  setSearch: (search: string) => void
  setAssignee: (assignee: string) => void
  reset: () => void
}

/**
 * 初期状態
 */
const initialState: InboxFilterState = {
  status: [],
  priority: [],
  tags: [],
  search: '',
  assignee: '',
}

/**
 * Inbox共通フィルタストア
 *
 * Board/Table間でフィルター状態を共有
 * LocalStorageで永続化
 */
export const useInboxFilterStore = create<InboxFilterStore>()(
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
      name: 'inbox-filter',
    }
  )
)
