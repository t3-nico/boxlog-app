import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { usePlanSortStore } from './usePlanSortStore';

describe('usePlanSortStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      usePlanSortStore.getState().clearSort();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('sortFieldはnull', () => {
      const { sortField } = usePlanSortStore.getState();
      expect(sortField).toBeNull();
    });

    it('sortDirectionはnull', () => {
      const { sortDirection } = usePlanSortStore.getState();
      expect(sortDirection).toBeNull();
    });
  });

  describe('setSortField', () => {
    it('新しいフィールドをクリックするとascで開始', () => {
      act(() => {
        usePlanSortStore.getState().setSortField('title');
      });

      const { sortField, sortDirection } = usePlanSortStore.getState();
      expect(sortField).toBe('title');
      expect(sortDirection).toBe('asc');
    });

    it('同じフィールドを再クリックするとdescになる', () => {
      act(() => {
        usePlanSortStore.getState().setSortField('title');
        usePlanSortStore.getState().setSortField('title');
      });

      const { sortField, sortDirection } = usePlanSortStore.getState();
      expect(sortField).toBe('title');
      expect(sortDirection).toBe('desc');
    });

    it('3回クリックするとソート解除（null）になる', () => {
      act(() => {
        usePlanSortStore.getState().setSortField('title');
        usePlanSortStore.getState().setSortField('title');
        usePlanSortStore.getState().setSortField('title');
      });

      const { sortField, sortDirection } = usePlanSortStore.getState();
      expect(sortField).toBeNull();
      expect(sortDirection).toBeNull();
    });

    it('別のフィールドをクリックするとascで新規開始', () => {
      act(() => {
        usePlanSortStore.getState().setSortField('title');
        usePlanSortStore.getState().setSortField('title'); // desc
        usePlanSortStore.getState().setSortField('created_at'); // 新しいフィールド
      });

      const { sortField, sortDirection } = usePlanSortStore.getState();
      expect(sortField).toBe('created_at');
      expect(sortDirection).toBe('asc');
    });

    it('全てのソートフィールドに対応', () => {
      const fields = ['title', 'duration', 'created_at', 'updated_at'] as const;

      fields.forEach((field) => {
        act(() => {
          usePlanSortStore.getState().clearSort();
          usePlanSortStore.getState().setSortField(field);
        });

        const { sortField } = usePlanSortStore.getState();
        expect(sortField).toBe(field);
      });
    });
  });

  describe('setSort', () => {
    it('フィールドと方向を直接設定できる', () => {
      act(() => {
        usePlanSortStore.getState().setSort('created_at', 'desc');
      });

      const { sortField, sortDirection } = usePlanSortStore.getState();
      expect(sortField).toBe('created_at');
      expect(sortDirection).toBe('desc');
    });

    it('ascを直接設定できる', () => {
      act(() => {
        usePlanSortStore.getState().setSort('title', 'asc');
      });

      const { sortDirection } = usePlanSortStore.getState();
      expect(sortDirection).toBe('asc');
    });
  });

  describe('clearSort', () => {
    it('ソートをクリアできる', () => {
      act(() => {
        usePlanSortStore.getState().setSortField('title');
        usePlanSortStore.getState().clearSort();
      });

      const { sortField, sortDirection } = usePlanSortStore.getState();
      expect(sortField).toBeNull();
      expect(sortDirection).toBeNull();
    });

    it('既にクリア状態でもエラーにならない', () => {
      act(() => {
        usePlanSortStore.getState().clearSort();
        usePlanSortStore.getState().clearSort();
      });

      const { sortField, sortDirection } = usePlanSortStore.getState();
      expect(sortField).toBeNull();
      expect(sortDirection).toBeNull();
    });
  });

  describe('ソートサイクル asc → desc → null', () => {
    it('完全なサイクルをテスト', () => {
      // 初期状態
      expect(usePlanSortStore.getState().sortField).toBeNull();
      expect(usePlanSortStore.getState().sortDirection).toBeNull();

      // 1回目: asc
      act(() => {
        usePlanSortStore.getState().setSortField('title');
      });
      expect(usePlanSortStore.getState().sortField).toBe('title');
      expect(usePlanSortStore.getState().sortDirection).toBe('asc');

      // 2回目: desc
      act(() => {
        usePlanSortStore.getState().setSortField('title');
      });
      expect(usePlanSortStore.getState().sortField).toBe('title');
      expect(usePlanSortStore.getState().sortDirection).toBe('desc');

      // 3回目: null（ソート解除）
      act(() => {
        usePlanSortStore.getState().setSortField('title');
      });
      expect(usePlanSortStore.getState().sortField).toBeNull();
      expect(usePlanSortStore.getState().sortDirection).toBeNull();

      // 4回目: 再びasc
      act(() => {
        usePlanSortStore.getState().setSortField('title');
      });
      expect(usePlanSortStore.getState().sortField).toBe('title');
      expect(usePlanSortStore.getState().sortDirection).toBe('asc');
    });
  });
});
