import { beforeEach, describe, expect, it } from 'vitest';

import { useTagMergeModalStore } from '@/stores/useTagMergeModalStore';

describe('useTagMergeModalStore', () => {
  beforeEach(() => {
    useTagMergeModalStore.getState().closeModal();
  });

  describe('初期状態', () => {
    it('モーダルが閉じている', () => {
      const state = useTagMergeModalStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.sourceTag).toBeNull();
      expect(state.hasChildren).toBe(false);
    });
  });

  describe('openModal', () => {
    it('マージ元タグを設定して開ける', () => {
      useTagMergeModalStore.getState().openModal({ id: 'tag-1', name: '仕事', color: '#f00' });
      const state = useTagMergeModalStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.sourceTag).toEqual({ id: 'tag-1', name: '仕事', color: '#f00' });
      expect(state.hasChildren).toBe(false);
    });

    it('子タグありで開ける', () => {
      useTagMergeModalStore.getState().openModal({ id: 'tag-2', name: '趣味' }, true);
      const state = useTagMergeModalStore.getState();
      expect(state.hasChildren).toBe(true);
    });

    it('colorがnullでも開ける', () => {
      useTagMergeModalStore.getState().openModal({ id: 'tag-3', name: 'テスト', color: null });
      expect(useTagMergeModalStore.getState().sourceTag?.color).toBeNull();
    });
  });

  describe('closeModal', () => {
    it('モーダルを閉じて全状態をリセット', () => {
      useTagMergeModalStore.getState().openModal({ id: 'tag-1', name: '仕事' }, true);
      useTagMergeModalStore.getState().closeModal();
      const state = useTagMergeModalStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.sourceTag).toBeNull();
      expect(state.hasChildren).toBe(false);
    });
  });
});
