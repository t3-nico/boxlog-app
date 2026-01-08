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
 * タグフィルターストアの状態
 */
interface TagFilterState {
  /** 使用状況フィルター */
  usage: UsageFilter;
  /** グループフィルター（グループIDリスト） */
  groups: string[];
  /** 作成日フィルター */
  createdAt: DateRangeFilter;

  // アクション
  setUsage: (usage: UsageFilter) => void;
  setGroups: (groups: string[]) => void;
  toggleGroup: (groupId: string) => void;
  setCreatedAt: (createdAt: DateRangeFilter) => void;
  reset: () => void;
}

const initialState = {
  usage: 'all' as UsageFilter,
  groups: [] as string[],
  createdAt: 'all' as DateRangeFilter,
};

/**
 * タグフィルターストア
 *
 * タグ一覧のフィルター状態を管理
 * - 使用状況: すべて / 未使用 / よく使う
 * - グループ: 複数選択可能
 * - 作成日: 日付範囲
 */
export const useTagFilterStore = create<TagFilterState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setUsage: (usage) => set({ usage }),

        setGroups: (groups) => set({ groups }),

        toggleGroup: (groupId) => {
          const { groups } = get();
          if (groups.includes(groupId)) {
            set({ groups: groups.filter((id) => id !== groupId) });
          } else {
            set({ groups: [...groups, groupId] });
          }
        },

        setCreatedAt: (createdAt) => set({ createdAt }),

        reset: () => set(initialState),
      }),
      {
        name: 'tag-filter-store',
        partialize: (state) => ({
          usage: state.usage,
          groups: state.groups,
          createdAt: state.createdAt,
        }),
      },
    ),
    { name: 'tag-filter-store' },
  ),
);
