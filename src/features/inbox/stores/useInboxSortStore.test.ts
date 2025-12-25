import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useInboxSortStore } from './useInboxSortStore';

describe('useInboxSortStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      useInboxSortStore.getState().clearSort();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('sortFieldはnull', () => {
      const { sortField } = useInboxSortStore.getState();
      expect(sortField).toBeNull();
    });

    it('sortDirectionはnull', () => {
      const { sortDirection } = useInboxSortStore.getState();
      expect(sortDirection).toBeNull();
    });
  });

  describe('setSortField', () => {
    it('新しいフィールドをクリックするとascで開始', () => {
      act(() => {
        useInboxSortStore.getState().setSortField('title');
      });

      const { sortField, sortDirection } = useInboxSortStore.getState();
      expect(sortField).toBe('title');
      expect(sortDirection).toBe('asc');
    });

    it('同じフィールドを再クリックするとdescになる', () => {
      act(() => {
        useInboxSortStore.getState().setSortField('title');
        useInboxSortStore.getState().setSortField('title');
      });

      const { sortField, sortDirection } = useInboxSortStore.getState();
      expect(sortField).toBe('title');
      expect(sortDirection).toBe('desc');
    });

    it('3回クリックするとソート解除（null）になる', () => {
      act(() => {
        useInboxSortStore.getState().setSortField('title');
        useInboxSortStore.getState().setSortField('title');
        useInboxSortStore.getState().setSortField('title');
      });

      const { sortField, sortDirection } = useInboxSortStore.getState();
      expect(sortField).toBeNull();
      expect(sortDirection).toBeNull();
    });

    it('別のフィールドをクリックするとascで新規開始', () => {
      act(() => {
        useInboxSortStore.getState().setSortField('title');
        useInboxSortStore.getState().setSortField('title'); // desc
        useInboxSortStore.getState().setSortField('created_at'); // 新しいフィールド
      });

      const { sortField, sortDirection } = useInboxSortStore.getState();
      expect(sortField).toBe('created_at');
      expect(sortDirection).toBe('asc');
    });

    it('全てのソートフィールドに対応', () => {
      const fields = ['id', 'title', 'status', 'duration', 'created_at', 'updated_at'] as const;

      fields.forEach((field) => {
        act(() => {
          useInboxSortStore.getState().clearSort();
          useInboxSortStore.getState().setSortField(field);
        });

        const { sortField } = useInboxSortStore.getState();
        expect(sortField).toBe(field);
      });
    });
  });

  describe('setSort', () => {
    it('フィールドと方向を直接設定できる', () => {
      act(() => {
        useInboxSortStore.getState().setSort('status', 'desc');
      });

      const { sortField, sortDirection } = useInboxSortStore.getState();
      expect(sortField).toBe('status');
      expect(sortDirection).toBe('desc');
    });

    it('ascを直接設定できる', () => {
      act(() => {
        useInboxSortStore.getState().setSort('title', 'asc');
      });

      const { sortDirection } = useInboxSortStore.getState();
      expect(sortDirection).toBe('asc');
    });
  });

  describe('clearSort', () => {
    it('ソートをクリアできる', () => {
      act(() => {
        useInboxSortStore.getState().setSortField('title');
        useInboxSortStore.getState().clearSort();
      });

      const { sortField, sortDirection } = useInboxSortStore.getState();
      expect(sortField).toBeNull();
      expect(sortDirection).toBeNull();
    });

    it('既にクリア状態でもエラーにならない', () => {
      act(() => {
        useInboxSortStore.getState().clearSort();
        useInboxSortStore.getState().clearSort();
      });

      const { sortField, sortDirection } = useInboxSortStore.getState();
      expect(sortField).toBeNull();
      expect(sortDirection).toBeNull();
    });
  });

  describe('ソートサイクル asc → desc → null', () => {
    it('完全なサイクルをテスト', () => {
      // 初期状態
      expect(useInboxSortStore.getState().sortField).toBeNull();
      expect(useInboxSortStore.getState().sortDirection).toBeNull();

      // 1回目: asc
      act(() => {
        useInboxSortStore.getState().setSortField('title');
      });
      expect(useInboxSortStore.getState().sortField).toBe('title');
      expect(useInboxSortStore.getState().sortDirection).toBe('asc');

      // 2回目: desc
      act(() => {
        useInboxSortStore.getState().setSortField('title');
      });
      expect(useInboxSortStore.getState().sortField).toBe('title');
      expect(useInboxSortStore.getState().sortDirection).toBe('desc');

      // 3回目: null（ソート解除）
      act(() => {
        useInboxSortStore.getState().setSortField('title');
      });
      expect(useInboxSortStore.getState().sortField).toBeNull();
      expect(useInboxSortStore.getState().sortDirection).toBeNull();

      // 4回目: 再びasc
      act(() => {
        useInboxSortStore.getState().setSortField('title');
      });
      expect(useInboxSortStore.getState().sortField).toBe('title');
      expect(useInboxSortStore.getState().sortDirection).toBe('asc');
    });
  });
});
