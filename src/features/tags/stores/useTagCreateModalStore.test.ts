import { beforeEach, describe, expect, it } from 'vitest';

import { useTagCreateModalStore } from './useTagCreateModalStore';

describe('useTagCreateModalStore', () => {
  beforeEach(() => {
    useTagCreateModalStore.getState().closeModal();
  });

  describe('初期状態', () => {
    it('モーダルが閉じている', () => {
      expect(useTagCreateModalStore.getState().isOpen).toBe(false);
      expect(useTagCreateModalStore.getState().defaultParentId).toBeNull();
    });
  });

  describe('openModal', () => {
    it('parentIdなしで開ける', () => {
      useTagCreateModalStore.getState().openModal();
      expect(useTagCreateModalStore.getState().isOpen).toBe(true);
      expect(useTagCreateModalStore.getState().defaultParentId).toBeNull();
    });

    it('parentIdありで開ける（子タグ作成）', () => {
      useTagCreateModalStore.getState().openModal('parent-1');
      expect(useTagCreateModalStore.getState().isOpen).toBe(true);
      expect(useTagCreateModalStore.getState().defaultParentId).toBe('parent-1');
    });
  });

  describe('closeModal', () => {
    it('モーダルを閉じてdefaultParentIdをクリア', () => {
      useTagCreateModalStore.getState().openModal('parent-1');
      useTagCreateModalStore.getState().closeModal();
      expect(useTagCreateModalStore.getState().isOpen).toBe(false);
      expect(useTagCreateModalStore.getState().defaultParentId).toBeNull();
    });
  });
});
