import { create } from 'zustand';

/** 累積チャートの期間フィルター */
export type StatsPeriod = 'week' | 'month' | 'year' | 'all';

interface StatsFilterState {
  /** 選択中のタグID（null = 全タグ表示） */
  selectedTagId: string | null;
  /** 選択中の期間フィルター */
  period: StatsPeriod;
  /** タグを選択（ドリルダウン） */
  setSelectedTag: (tagId: string | null) => void;
  /** 期間を変更 */
  setPeriod: (period: StatsPeriod) => void;
}

export const useStatsFilterStore = create<StatsFilterState>((set) => ({
  selectedTagId: null,
  period: 'all',
  setSelectedTag: (tagId) => set({ selectedTagId: tagId }),
  setPeriod: (period) => set({ period }),
}));
