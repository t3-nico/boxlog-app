import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * 使用状況フィルター
 */
export type UsageFilter = 'all' | 'unused' | 'frequently_used';

/**
 * 日付範囲フィルター
 */
export type DateRangeFilter = 'all' | 'today' | 'this_week' | 'this_month';

/**
 * グループフィルター
 * - 'all': すべてのグループ
 * - 'uncategorized': 未分類（group_id = null）
 * - UUID: 特定のグループ
 */
export type GroupFilter = 'all' | 'uncategorized' | string;

/**
 * タグフィルターストアの状態
 */
interface TagFilterState {
  /** 使用状況フィルター */
  usage: UsageFilter;
  /** グループフィルター（単一選択） */
  selectedGroup: GroupFilter;
  /** 作成日フィルター */
  createdAt: DateRangeFilter;

  // アクション
  setUsage: (usage: UsageFilter) => void;
  setSelectedGroup: (group: GroupFilter) => void;
  setCreatedAt: (createdAt: DateRangeFilter) => void;
  reset: () => void;
}

const initialState = {
  usage: 'all' as UsageFilter,
  selectedGroup: 'all' as GroupFilter,
  createdAt: 'all' as DateRangeFilter,
};

/**
 * タグフィルターストア
 *
 * タグ一覧のフィルター状態を管理
 * - 使用状況: すべて / 未使用 / よく使う
 * - グループ: 単一選択（all / uncategorized / グループID）
 * - 作成日: 日付範囲
 */
export const useTagFilterStore = create<TagFilterState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUsage: (usage) => set({ usage }),

        setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

        setCreatedAt: (createdAt) => set({ createdAt }),

        reset: () => set(initialState),
      }),
      {
        name: 'tag-filter-store-v2',
        partialize: (state) => ({
          usage: state.usage,
          selectedGroup: state.selectedGroup,
          createdAt: state.createdAt,
        }),
      },
    ),
    { name: 'tag-filter-store' },
  ),
);
