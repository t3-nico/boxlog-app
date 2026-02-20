import type { DateRangeFilter } from '@/lib/date';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
interface RecordFilterState {
  /** 作業日フィルター */
  workedAt: WorkedAtFilter;
  /** Plan タイトル検索 */
  planSearch: string;
  /** タグフィルター（OR条件） */
  tags: string[];
  /** 充実度フィルター */
  fulfillment: FulfillmentFilter;
  /** 時間フィルター */
  duration: DurationFilter;
  /** タイトル/メモ検索 */
  search: string;
  /** 作成日フィルター */
  createdAt: DateRangeFilter;
  /** 更新日フィルター */
  updatedAt: DateRangeFilter;
  /** 検索UIの展開状態 */
  isSearchOpen: boolean;
}

/**
 * Record フィルタストア
 */
interface RecordFilterStore extends RecordFilterState {
  setWorkedAt: (workedAt: WorkedAtFilter) => void;
  setPlanSearch: (planSearch: string) => void;
  setTags: (tags: string[]) => void;
  setFulfillment: (fulfillment: FulfillmentFilter) => void;
  setDuration: (duration: DurationFilter) => void;
  setSearch: (search: string) => void;
  setCreatedAt: (createdAt: DateRangeFilter) => void;
  setUpdatedAt: (updatedAt: DateRangeFilter) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  reset: () => void;
  /** アクティブなフィルタ数を取得 */
  getActiveFilterCount: () => number;
}

/**
 * 初期状態
 */
const initialState: RecordFilterState = {
  workedAt: 'all',
  planSearch: '',
  tags: [],
  fulfillment: 'all',
  duration: 'all',
  search: '',
  createdAt: 'all',
  updatedAt: 'all',
  isSearchOpen: false,
};

/**
 * Record フィルタストア
 *
 * LocalStorage で永続化
 */
export const useRecordFilterStore = create<RecordFilterStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setWorkedAt: (workedAt) => set({ workedAt }),
      setPlanSearch: (planSearch) => set({ planSearch }),
      setTags: (tags) => set({ tags }),
      setFulfillment: (fulfillment) => set({ fulfillment }),
      setDuration: (duration) => set({ duration }),
      setSearch: (search) => set({ search }),
      setCreatedAt: (createdAt) => set({ createdAt }),
      setUpdatedAt: (updatedAt) => set({ updatedAt }),
      setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
      reset: () => set(initialState),
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
    {
      name: 'record-filter',
      // isSearchOpen は永続化しない
      partialize: (state) => ({
        workedAt: state.workedAt,
        planSearch: state.planSearch,
        tags: state.tags,
        fulfillment: state.fulfillment,
        duration: state.duration,
        search: state.search,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
