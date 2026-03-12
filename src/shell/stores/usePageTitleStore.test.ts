import { beforeEach, describe, expect, it } from 'vitest';

import { usePageTitleStore } from './usePageTitleStore';

describe('usePageTitleStore', () => {
  beforeEach(() => {
    usePageTitleStore.getState().clearTitle();
  });

  describe('初期状態', () => {
    it('タイトルが空文字', () => {
      expect(usePageTitleStore.getState().title).toBe('');
    });
  });

  describe('setTitle', () => {
    it('タイトルを設定できる', () => {
      usePageTitleStore.getState().setTitle('Calendar');
      expect(usePageTitleStore.getState().title).toBe('Calendar');
    });

    it('上書きできる', () => {
      usePageTitleStore.getState().setTitle('Calendar');
      usePageTitleStore.getState().setTitle('Records');
      expect(usePageTitleStore.getState().title).toBe('Records');
    });
  });

  describe('clearTitle', () => {
    it('タイトルをクリアできる', () => {
      usePageTitleStore.getState().setTitle('Settings');
      usePageTitleStore.getState().clearTitle();
      expect(usePageTitleStore.getState().title).toBe('');
    });
  });
});
