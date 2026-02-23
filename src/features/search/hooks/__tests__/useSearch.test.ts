import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSearchHistory } from '../useSearch';

describe('useSearchHistory', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  describe('初期状態', () => {
    it('localStorageが空の場合は空配列', () => {
      const { result } = renderHook(() => useSearchHistory());
      expect(result.current.history).toEqual([]);
    });

    it('localStorageから既存の履歴を読み込む', () => {
      mockStorage['search-history'] = JSON.stringify(['query1', 'query2']);

      const { result } = renderHook(() => useSearchHistory());
      expect(result.current.history).toEqual(['query1', 'query2']);
    });

    it('不正なJSONはエラーなく空配列を返す', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockStorage['search-history'] = 'invalid-json';

      const { result } = renderHook(() => useSearchHistory());
      expect(result.current.history).toEqual([]);
      spy.mockRestore();
    });
  });

  describe('addToHistory', () => {
    it('クエリを履歴の先頭に追加する', () => {
      const { result } = renderHook(() => useSearchHistory());

      act(() => {
        result.current.addToHistory('new query');
      });

      expect(result.current.history[0]).toBe('new query');
    });

    it('重複するクエリは先頭に移動される', () => {
      mockStorage['search-history'] = JSON.stringify(['old', 'duplicate', 'other']);

      const { result } = renderHook(() => useSearchHistory());

      act(() => {
        result.current.addToHistory('duplicate');
      });

      expect(result.current.history[0]).toBe('duplicate');
      expect(result.current.history.filter((q) => q === 'duplicate')).toHaveLength(1);
    });

    it('最大10件まで保持する', () => {
      const { result } = renderHook(() => useSearchHistory());

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addToHistory(`query-${i}`);
        }
      });

      expect(result.current.history).toHaveLength(10);
    });

    it('空文字は追加されない', () => {
      const { result } = renderHook(() => useSearchHistory());

      act(() => {
        result.current.addToHistory('');
        result.current.addToHistory('   ');
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('localStorageに保存される', () => {
      const { result } = renderHook(() => useSearchHistory());

      act(() => {
        result.current.addToHistory('saved query');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'search-history',
        expect.stringContaining('saved query'),
      );
    });
  });

  describe('clearHistory', () => {
    it('履歴をクリアする', () => {
      mockStorage['search-history'] = JSON.stringify(['query1', 'query2']);

      const { result } = renderHook(() => useSearchHistory());

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('search-history');
    });
  });
});
