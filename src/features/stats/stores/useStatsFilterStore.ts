import { create } from 'zustand';

import { addDays, addMonths, addWeeks } from '@/lib/date/core';

/** Stats の表示粒度 */
export type StatsGranularity = 'day' | 'week' | 'month' | 'year';

interface StatsFilterState {
  /** 選択中のタグID（null = 全タグ表示） */
  selectedTagId: string | null;
  /** 表示粒度 */
  granularity: StatsGranularity;
  /** ナビゲーション基準日 */
  currentDate: Date;
  /** タグを選択（ドリルダウン） */
  setSelectedTag: (tagId: string | null) => void;
  /** 粒度を変更 */
  setGranularity: (granularity: StatsGranularity) => void;
  /** 基準日を設定 */
  setCurrentDate: (date: Date) => void;
  /** 前後・今日へナビゲーション */
  navigate: (direction: 'prev' | 'next' | 'today') => void;
}

function navigateDate(
  currentDate: Date,
  granularity: StatsGranularity,
  direction: 'prev' | 'next' | 'today',
): Date {
  if (direction === 'today') return new Date();

  const delta = direction === 'next' ? 1 : -1;

  switch (granularity) {
    case 'day':
      return addDays(currentDate, delta);
    case 'week':
      return addWeeks(currentDate, delta);
    case 'month':
      return addMonths(currentDate, delta);
    case 'year': {
      const result = new Date(currentDate);
      result.setFullYear(result.getFullYear() + delta);
      return result;
    }
  }
}

export const useStatsFilterStore = create<StatsFilterState>((set, get) => ({
  selectedTagId: null,
  granularity: 'week',
  currentDate: new Date(),
  setSelectedTag: (tagId) => set({ selectedTagId: tagId }),
  setGranularity: (granularity) => set({ granularity }),
  setCurrentDate: (date) => set({ currentDate: date }),
  navigate: (direction) => {
    const { currentDate, granularity } = get();
    set({ currentDate: navigateDate(currentDate, granularity, direction) });
  },
}));
