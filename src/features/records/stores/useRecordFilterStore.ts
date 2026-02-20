import type { DateRangeFilter } from '@/lib/date';
import type { BaseFilterState } from '@/stores/createFilterStore';
import { createFilterStore } from '@/stores/createFilterStore';

/**
 * 作業日フィルタータイプ
 */
export type WorkedAtFilter =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'all';

/**
 * 充実度フィルタータイプ
 */
export type FulfillmentFilter = 'all' | '1' | '2' | '3' | '4' | '5' | 'unrated';

/**
 * 時間フィルタータイプ
 * short: <30分, medium: 30-60分, long: >60分
 */
export type DurationFilter = 'all' | 'short' | 'medium' | 'long';

// DateRangeFilter は @/lib/date から再エクスポート
export type { DateRangeFilter };

/**
 * Record フィルタ状態
 */
interface RecordFilterState extends BaseFilterState {
  workedAt: WorkedAtFilter;
  planSearch: string;
  tags: string[];
  fulfillment: FulfillmentFilter;
  duration: DurationFilter;
  search: string;
  createdAt: DateRangeFilter;
  updatedAt: DateRangeFilter;
}

/**
 * Record フィルタストア追加アクション
 */
interface RecordFilterExtraActions {
  /** アクティブなフィルタ数を取得 */
  getActiveFilterCount: () => number;
}

/**
 * Record フィルタストア
 *
 * LocalStorage で永続化
 */
export const useRecordFilterStore = createFilterStore<RecordFilterState, RecordFilterExtraActions>({
  name: 'record-filter',
  initialState: {
    workedAt: 'all',
    planSearch: '',
    tags: [],
    fulfillment: 'all',
    duration: 'all',
    search: '',
    createdAt: 'all',
    updatedAt: 'all',
    isSearchOpen: false,
  },
  extraActions: (_, get) => ({
    getActiveFilterCount: () => {
      const state = get();
      let count = 0;
      if (state.workedAt !== 'all') count++;
      if (state.planSearch) count++;
      if (state.tags.length > 0) count++;
      if (state.fulfillment !== 'all') count++;
      if (state.duration !== 'all') count++;
      if (state.search) count++;
      if (state.createdAt !== 'all') count++;
      if (state.updatedAt !== 'all') count++;
      return count;
    },
  }),
});
