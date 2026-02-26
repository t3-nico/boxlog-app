import type { DateRangeFilter } from '@/lib/date';
import type { BaseFilterState } from '@/stores/createFilterStore';
import { createFilterStore } from '@/stores/createFilterStore';
import type { PlanStatus } from '../types/plan';

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

// DateRangeFilter は @/lib/date から再エクスポート
export type { DateRangeFilter };

/**
 * Plan フィルタ状態
 */
interface PlanFilterState extends BaseFilterState {
  status: PlanStatus[];
  tags: string[];
  search: string;
  assignee: string;
  recurrence: RecurrenceFilter;
  reminder: ReminderFilter;
  schedule: ScheduleFilter;
  createdAt: DateRangeFilter;
  updatedAt: DateRangeFilter;
}

/**
 * Plan フィルタストア
 *
 * Board/Table間でフィルター状態を共有
 * LocalStorageで永続化
 */
export const usePlanFilterStore = createFilterStore<PlanFilterState>({
  name: 'plan-filter',
  initialState: {
    status: [],
    tags: [],
    search: '',
    assignee: '',
    recurrence: 'all',
    reminder: 'all',
    schedule: 'all',
    createdAt: 'all',
    updatedAt: 'all',
    isSearchOpen: false,
  },
});
