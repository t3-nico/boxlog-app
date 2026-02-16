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
 * 繰り返しフィルタータイプ
 */
export type RecurrenceFilter = 'all' | 'yes' | 'no';

/**
 * リマインダーフィルタータイプ
 */
export type ReminderFilter = 'all' | 'yes' | 'no';

/**
 * スケジュールフィルタータイプ
 */
export type ScheduleFilter = 'all' | 'scheduled' | 'unscheduled';

/**
 * 日付範囲フィルタータイプ（作成日・更新日共通）
 */
export type DateRangeFilter =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month';

/**
 * Plan共通フィルタ状態
 * Board/Table両方で共有するフィルター
 */
interface PlanFilterState {
  status: PlanStatus[];
  tags: string[];
  search: string;
  assignee: string;
  dueDate: DueDateFilter;
  recurrence: RecurrenceFilter;
  reminder: ReminderFilter;
  schedule: ScheduleFilter;
  createdAt: DateRangeFilter;
  updatedAt: DateRangeFilter;
  /** 検索UIの展開状態（再マウント耐性のため） */
  isSearchOpen: boolean;
}

/**
 * Plan共通フィルタストア
 */
interface PlanFilterStore extends PlanFilterState {
  setStatus: (status: PlanStatus[]) => void;
  setTags: (tags: string[]) => void;
  setSearch: (search: string) => void;
  setAssignee: (assignee: string) => void;
  setDueDate: (dueDate: DueDateFilter) => void;
  setRecurrence: (recurrence: RecurrenceFilter) => void;
  setReminder: (reminder: ReminderFilter) => void;
  setSchedule: (schedule: ScheduleFilter) => void;
  setCreatedAt: (createdAt: DateRangeFilter) => void;
  setUpdatedAt: (updatedAt: DateRangeFilter) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  reset: () => void;
}

/**
 * 初期状態
 */
const initialState: PlanFilterState = {
  status: [],
  tags: [],
  search: '',
  assignee: '',
  dueDate: 'all',
  recurrence: 'all',
  reminder: 'all',
  schedule: 'all',
  createdAt: 'all',
  updatedAt: 'all',
  isSearchOpen: false,
};

/**
 * Plan共通フィルタストア
 *
 * Board/Table間でフィルター状態を共有
 * LocalStorageで永続化
 */
export const usePlanFilterStore = create<PlanFilterStore>()(
  persist(
    (set) => ({
      ...initialState,
      setStatus: (status) => set({ status }),
      setTags: (tags) => set({ tags }),
      setSearch: (search) => set({ search }),
      setAssignee: (assignee) => set({ assignee }),
      setDueDate: (dueDate) => set({ dueDate }),
      setRecurrence: (recurrence) => set({ recurrence }),
      setReminder: (reminder) => set({ reminder }),
      setSchedule: (schedule) => set({ schedule }),
      setCreatedAt: (createdAt) => set({ createdAt }),
      setUpdatedAt: (updatedAt) => set({ updatedAt }),
      setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
      reset: () => set(initialState),
    }),
    {
      name: 'plan-filter',
      version: 1,
      // isSearchOpenは永続化しない（ページリロード時は閉じているべき）
      partialize: (state) => ({
        status: state.status,
        tags: state.tags,
        search: state.search,
        assignee: state.assignee,
        dueDate: state.dueDate,
        recurrence: state.recurrence,
        reminder: state.reminder,
        schedule: state.schedule,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
