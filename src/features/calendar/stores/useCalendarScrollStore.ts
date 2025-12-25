import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CalendarViewType } from '@/features/settings/stores/useCalendarSettingsStore';

/**
 * カレンダーのスクロール位置を管理するストア
 *
 * 各ビュータイプごとにスクロール位置を記憶し、
 * ビュー切り替え時に復元する
 */

interface ScrollPositions {
  day: number;
  '3day': number;
  '5day': number;
  week: number;
}

interface CalendarScrollState {
  /** ビューごとのスクロール位置（px） */
  scrollPositions: ScrollPositions;
  /** 最後に使用したビュー */
  lastActiveView: CalendarViewType;
}

interface CalendarScrollActions {
  /** スクロール位置を更新 */
  setScrollPosition: (view: CalendarViewType, position: number) => void;
  /** 特定ビューのスクロール位置を取得 */
  getScrollPosition: (view: CalendarViewType) => number;
  /** 最後のアクティブビューを更新 */
  setLastActiveView: (view: CalendarViewType) => void;
  /** スクロール位置をリセット */
  resetScrollPositions: () => void;
}

const DEFAULT_SCROLL_POSITION = 0;

const initialState: CalendarScrollState = {
  scrollPositions: {
    day: DEFAULT_SCROLL_POSITION,
    '3day': DEFAULT_SCROLL_POSITION,
    '5day': DEFAULT_SCROLL_POSITION,
    week: DEFAULT_SCROLL_POSITION,
  },
  lastActiveView: 'week',
};

export const useCalendarScrollStore = create<CalendarScrollState & CalendarScrollActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setScrollPosition: (view, position) =>
        set((state) => ({
          scrollPositions: {
            ...state.scrollPositions,
            [view]: position,
          },
        })),

      getScrollPosition: (view) => {
        const state = get();
        return state.scrollPositions[view] ?? DEFAULT_SCROLL_POSITION;
      },

      setLastActiveView: (view) => set({ lastActiveView: view }),

      resetScrollPositions: () => set({ scrollPositions: initialState.scrollPositions }),
    }),
    {
      name: 'calendar-scroll-positions',
    },
  ),
);
