import { beforeEach, describe, expect, it } from 'vitest';

import { useStatsFilterStore } from './useStatsFilterStore';

describe('useStatsFilterStore', () => {
  beforeEach(() => {
    useStatsFilterStore.setState({
      selectedTagId: null,
      period: 'all',
    });
  });

  describe('初期状態', () => {
    it('selectedTagIdがnull', () => {
      expect(useStatsFilterStore.getState().selectedTagId).toBeNull();
    });

    it('periodがall', () => {
      expect(useStatsFilterStore.getState().period).toBe('all');
    });
  });

  describe('setSelectedTag', () => {
    it('タグIDを設定できる', () => {
      useStatsFilterStore.getState().setSelectedTag('tag-1');
      expect(useStatsFilterStore.getState().selectedTagId).toBe('tag-1');
    });

    it('nullで全タグ表示に戻せる', () => {
      useStatsFilterStore.getState().setSelectedTag('tag-1');
      useStatsFilterStore.getState().setSelectedTag(null);
      expect(useStatsFilterStore.getState().selectedTagId).toBeNull();
    });

    it('タグIDを切り替えできる', () => {
      useStatsFilterStore.getState().setSelectedTag('tag-1');
      useStatsFilterStore.getState().setSelectedTag('tag-2');
      expect(useStatsFilterStore.getState().selectedTagId).toBe('tag-2');
    });
  });

  describe('setPeriod', () => {
    it('weekに切り替えできる', () => {
      useStatsFilterStore.getState().setPeriod('week');
      expect(useStatsFilterStore.getState().period).toBe('week');
    });

    it('monthに切り替えできる', () => {
      useStatsFilterStore.getState().setPeriod('month');
      expect(useStatsFilterStore.getState().period).toBe('month');
    });

    it('yearに切り替えできる', () => {
      useStatsFilterStore.getState().setPeriod('year');
      expect(useStatsFilterStore.getState().period).toBe('year');
    });

    it('allに戻せる', () => {
      useStatsFilterStore.getState().setPeriod('week');
      useStatsFilterStore.getState().setPeriod('all');
      expect(useStatsFilterStore.getState().period).toBe('all');
    });
  });

  describe('状態の独立性', () => {
    it('setPeriodがselectedTagIdに影響しない', () => {
      useStatsFilterStore.getState().setSelectedTag('tag-1');
      useStatsFilterStore.getState().setPeriod('week');

      expect(useStatsFilterStore.getState().selectedTagId).toBe('tag-1');
    });

    it('setSelectedTagがperiodに影響しない', () => {
      useStatsFilterStore.getState().setPeriod('month');
      useStatsFilterStore.getState().setSelectedTag('tag-1');

      expect(useStatsFilterStore.getState().period).toBe('month');
    });
  });
});
