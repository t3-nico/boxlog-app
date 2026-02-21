import { beforeEach, describe, expect, it } from 'vitest';

import { useCalendarScrollStore } from './useCalendarScrollStore';

describe('useCalendarScrollStore', () => {
  beforeEach(() => {
    useCalendarScrollStore.getState().resetScrollPositions();
    useCalendarScrollStore.setState({ lastActiveView: 'week' });
  });

  describe('初期状態', () => {
    it('全ビューのスクロール位置が0', () => {
      const state = useCalendarScrollStore.getState();
      expect(state.scrollPositions.day).toBe(0);
      expect(state.scrollPositions['3day']).toBe(0);
      expect(state.scrollPositions['5day']).toBe(0);
      expect(state.scrollPositions.week).toBe(0);
    });

    it('lastActiveViewがweek', () => {
      expect(useCalendarScrollStore.getState().lastActiveView).toBe('week');
    });
  });

  describe('setScrollPosition', () => {
    it('特定ビューのスクロール位置を設定', () => {
      useCalendarScrollStore.getState().setScrollPosition('day', 500);
      expect(useCalendarScrollStore.getState().scrollPositions.day).toBe(500);
      // 他は維持
      expect(useCalendarScrollStore.getState().scrollPositions.week).toBe(0);
    });
  });

  describe('getScrollPosition', () => {
    it('設定済みの位置を取得', () => {
      useCalendarScrollStore.getState().setScrollPosition('week', 300);
      expect(useCalendarScrollStore.getState().getScrollPosition('week')).toBe(300);
    });

    it('未設定のビューは0を返す', () => {
      expect(useCalendarScrollStore.getState().getScrollPosition('day')).toBe(0);
    });
  });

  describe('setLastActiveView', () => {
    it('最後のアクティブビューを更新', () => {
      useCalendarScrollStore.getState().setLastActiveView('3day');
      expect(useCalendarScrollStore.getState().lastActiveView).toBe('3day');
    });
  });

  describe('resetScrollPositions', () => {
    it('全ビューのスクロール位置をリセット', () => {
      useCalendarScrollStore.getState().setScrollPosition('day', 100);
      useCalendarScrollStore.getState().setScrollPosition('week', 200);
      useCalendarScrollStore.getState().resetScrollPositions();
      const pos = useCalendarScrollStore.getState().scrollPositions;
      expect(pos.day).toBe(0);
      expect(pos.week).toBe(0);
    });
  });
});
