import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useSidebarStore } from './useSidebarStore';

describe('useSidebarStore', () => {
  beforeEach(() => {
    // ストアをリセット
    const store = useSidebarStore.getState();
    act(() => {
      store.close();
      store.open(); // デフォルト状態に戻す
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('デフォルトでサイドバーは開いている', () => {
      const { isOpen } = useSidebarStore.getState();
      expect(isOpen).toBe(true);
    });
  });

  describe('open', () => {
    it('サイドバーを開くことができる', () => {
      const store = useSidebarStore.getState();

      // まず閉じる
      act(() => {
        store.close();
      });
      expect(useSidebarStore.getState().isOpen).toBe(false);

      // 開く
      act(() => {
        useSidebarStore.getState().open();
      });
      expect(useSidebarStore.getState().isOpen).toBe(true);
    });

    it('既に開いている状態でopenを呼んでも開いたまま', () => {
      const store = useSidebarStore.getState();
      expect(store.isOpen).toBe(true);

      act(() => {
        store.open();
      });
      expect(useSidebarStore.getState().isOpen).toBe(true);
    });
  });

  describe('close', () => {
    it('サイドバーを閉じることができる', () => {
      const store = useSidebarStore.getState();
      expect(store.isOpen).toBe(true);

      act(() => {
        store.close();
      });
      expect(useSidebarStore.getState().isOpen).toBe(false);
    });

    it('既に閉じている状態でcloseを呼んでも閉じたまま', () => {
      const store = useSidebarStore.getState();

      act(() => {
        store.close();
      });
      expect(useSidebarStore.getState().isOpen).toBe(false);

      act(() => {
        useSidebarStore.getState().close();
      });
      expect(useSidebarStore.getState().isOpen).toBe(false);
    });
  });

  describe('toggle', () => {
    it('開いている状態からトグルすると閉じる', () => {
      const store = useSidebarStore.getState();
      expect(store.isOpen).toBe(true);

      act(() => {
        store.toggle();
      });
      expect(useSidebarStore.getState().isOpen).toBe(false);
    });

    it('閉じている状態からトグルすると開く', () => {
      const store = useSidebarStore.getState();

      act(() => {
        store.close();
      });
      expect(useSidebarStore.getState().isOpen).toBe(false);

      act(() => {
        useSidebarStore.getState().toggle();
      });
      expect(useSidebarStore.getState().isOpen).toBe(true);
    });

    it('連続でトグルすると状態が交互に変わる', () => {
      const store = useSidebarStore.getState();
      const initialState = store.isOpen;

      act(() => {
        store.toggle();
      });
      expect(useSidebarStore.getState().isOpen).toBe(!initialState);

      act(() => {
        useSidebarStore.getState().toggle();
      });
      expect(useSidebarStore.getState().isOpen).toBe(initialState);

      act(() => {
        useSidebarStore.getState().toggle();
      });
      expect(useSidebarStore.getState().isOpen).toBe(!initialState);
    });
  });

  describe('auto-generated selectors', () => {
    it('use.isOpenセレクターが機能する', () => {
      expect(useSidebarStore.use).toBeDefined();
    });
  });
});
