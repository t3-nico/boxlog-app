import { create } from 'zustand';

interface StatsFilterState {
  /** 選択中のタグID（null = 全タグ表示） */
  selectedTagId: string | null;
  /** タグを選択（ドリルダウン） */
  setSelectedTag: (tagId: string | null) => void;
}

export const useStatsFilterStore = create<StatsFilterState>((set) => ({
  selectedTagId: null,
  setSelectedTag: (tagId) => set({ selectedTagId: tagId }),
}));
