import { beforeEach, describe, expect, it } from 'vitest';

import { useTagCreateModalStore } from '@/stores/useTagCreateModalStore';

describe('useTagCreateModalStore', () => {
  beforeEach(() => {
    useTagCreateModalStore.getState().closeModal();
  });

  describe('初期状態', () => {
    it('モーダルが閉じている', () => {
      expect(useTagCreateModalStore.getState().isOpen).toBe(false);
    });
  });

  describe('openModal', () => {
    it('モーダルを開ける', () => {
      useTagCreateModalStore.getState().openModal();
      expect(useTagCreateModalStore.getState().isOpen).toBe(true);
    });
  });

  describe('closeModal', () => {
    it('モーダルを閉じる', () => {
      useTagCreateModalStore.getState().openModal();
      useTagCreateModalStore.getState().closeModal();
      expect(useTagCreateModalStore.getState().isOpen).toBe(false);
    });
  });
});
