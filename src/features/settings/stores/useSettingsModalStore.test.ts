import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsModalStore } from './useSettingsModalStore';

describe('useSettingsModalStore', () => {
  beforeEach(() => {
    useSettingsModalStore.getState().closeModal();
  });

  describe('初期状態', () => {
    it('モーダルが閉じている', () => {
      expect(useSettingsModalStore.getState().isOpen).toBe(false);
    });

    it('デフォルトカテゴリがgeneral', () => {
      expect(useSettingsModalStore.getState().selectedCategory).toBe('general');
    });
  });

  describe('openModal', () => {
    it('デフォルトカテゴリで開ける', () => {
      useSettingsModalStore.getState().openModal();
      const state = useSettingsModalStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.selectedCategory).toBe('general');
    });

    it('指定カテゴリで開ける', () => {
      useSettingsModalStore.getState().openModal('notifications');
      const state = useSettingsModalStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.selectedCategory).toBe('notifications');
    });

    it('accountカテゴリで開ける', () => {
      useSettingsModalStore.getState().openModal('account');
      expect(useSettingsModalStore.getState().selectedCategory).toBe('account');
    });
  });

  describe('closeModal', () => {
    it('モーダルを閉じる', () => {
      useSettingsModalStore.getState().openModal('calendar');
      useSettingsModalStore.getState().closeModal();
      expect(useSettingsModalStore.getState().isOpen).toBe(false);
    });
  });

  describe('setCategory', () => {
    it('カテゴリを変更できる', () => {
      useSettingsModalStore.getState().openModal();
      useSettingsModalStore.getState().setCategory('data-controls');
      expect(useSettingsModalStore.getState().selectedCategory).toBe('data-controls');
    });

    it('全カテゴリに切り替えできる', () => {
      const categories = [
        'general',
        'calendar',
        'personalization',
        'notifications',
        'data-controls',
        'integrations',
        'account',
        'subscription',
      ] as const;

      for (const category of categories) {
        useSettingsModalStore.getState().setCategory(category);
        expect(useSettingsModalStore.getState().selectedCategory).toBe(category);
      }
    });
  });
});
