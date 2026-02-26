import { beforeEach, describe, expect, it } from 'vitest';

import { useRecordFilterStore } from '@/stores/useRecordFilterStore';

describe('useRecordFilterStore', () => {
  beforeEach(() => {
    useRecordFilterStore.getState().reset();
  });

  describe('初期状態', () => {
    it('デフォルト値が正しい', () => {
      const state = useRecordFilterStore.getState();
      expect(state.workedAt).toBe('all');
      expect(state.planSearch).toBe('');
      expect(state.tags).toEqual([]);
      expect(state.fulfillment).toBe('all');
      expect(state.duration).toBe('all');
      expect(state.search).toBe('');
      expect(state.createdAt).toBe('all');
      expect(state.updatedAt).toBe('all');
      expect(state.isSearchOpen).toBe(false);
    });
  });

  describe('自動生成されたsetter', () => {
    it('setWorkedAtで作業日フィルタを設定', () => {
      useRecordFilterStore.getState().setWorkedAt('today');
      expect(useRecordFilterStore.getState().workedAt).toBe('today');
    });

    it('setTagsでタグフィルタを設定', () => {
      useRecordFilterStore.getState().setTags(['tag-1', 'tag-2']);
      expect(useRecordFilterStore.getState().tags).toEqual(['tag-1', 'tag-2']);
    });

    it('setFulfillmentで充実度フィルタを設定', () => {
      useRecordFilterStore.getState().setFulfillment('5');
      expect(useRecordFilterStore.getState().fulfillment).toBe('5');
    });

    it('setDurationで時間フィルタを設定', () => {
      useRecordFilterStore.getState().setDuration('long');
      expect(useRecordFilterStore.getState().duration).toBe('long');
    });

    it('setSearchで検索文字列を設定', () => {
      useRecordFilterStore.getState().setSearch('テスト');
      expect(useRecordFilterStore.getState().search).toBe('テスト');
    });
  });

  describe('reset', () => {
    it('全フィルタを初期状態にリセット', () => {
      useRecordFilterStore.getState().setWorkedAt('today');
      useRecordFilterStore.getState().setTags(['tag-1']);
      useRecordFilterStore.getState().setFulfillment('3');
      useRecordFilterStore.getState().reset();
      const state = useRecordFilterStore.getState();
      expect(state.workedAt).toBe('all');
      expect(state.tags).toEqual([]);
      expect(state.fulfillment).toBe('all');
    });
  });

  describe('getActiveFilterCount', () => {
    it('フィルタなしは0', () => {
      expect(useRecordFilterStore.getState().getActiveFilterCount()).toBe(0);
    });

    it('各フィルタをカウントする', () => {
      useRecordFilterStore.getState().setWorkedAt('today');
      expect(useRecordFilterStore.getState().getActiveFilterCount()).toBe(1);

      useRecordFilterStore.getState().setTags(['tag-1']);
      expect(useRecordFilterStore.getState().getActiveFilterCount()).toBe(2);

      useRecordFilterStore.getState().setFulfillment('5');
      expect(useRecordFilterStore.getState().getActiveFilterCount()).toBe(3);

      useRecordFilterStore.getState().setDuration('short');
      expect(useRecordFilterStore.getState().getActiveFilterCount()).toBe(4);

      useRecordFilterStore.getState().setSearch('検索');
      expect(useRecordFilterStore.getState().getActiveFilterCount()).toBe(5);
    });
  });

  describe('setIsSearchOpen', () => {
    it('検索UIの展開状態を変更できる', () => {
      useRecordFilterStore.getState().setIsSearchOpen(true);
      expect(useRecordFilterStore.getState().isSearchOpen).toBe(true);
    });
  });
});
