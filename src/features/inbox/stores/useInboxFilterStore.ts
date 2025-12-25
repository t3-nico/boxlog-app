import type { PlanStatus } from '@/features/plans/types/plan';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 期限フィルタータイプ
 */
export type DueDateFilter =
  | 'today'
  | 'tomorrow'
  | 'this_week'
  | 'next_week'
  | 'overdue'
  | 'no_due_date'
  | 'all';

/**
 * Inbox共通フィルタ状態
 * Board/Table両方で共有するフィルター
 */
interface InboxFilterState {
  status: PlanStatus[];
  tags: string[];
  search: string;
  assignee: string;
  dueDate: DueDateFilter;
}

/**
 * Inbox共通フィルタストア
 */
interface InboxFilterStore extends InboxFilterState {
  setStatus: (status: PlanStatus[]) => void;
  setTags: (tags: string[]) => void;
  setSearch: (search: string) => void;
  setAssignee: (assignee: string) => void;
  setDueDate: (dueDate: DueDateFilter) => void;
  reset: () => void;
}

/**
 * 初期状態
 */
const initialState: InboxFilterState = {
  status: [],
  tags: [],
  search: '',
  assignee: '',
  dueDate: 'all',
};

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
      setTags: (tags) => set({ tags }),
      setSearch: (search) => set({ search }),
      setAssignee: (assignee) => set({ assignee }),
      setDueDate: (dueDate) => set({ dueDate }),
      reset: () => set(initialState),
    }),
    {
      name: 'inbox-filter',
    },
  ),
);
