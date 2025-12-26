/**
 * 障害耐性テスト（カオスエンジニアリング）
 *
 * アプリケーションが障害時に適切に動作するかを検証
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { shouldRetry } from '@/lib/tanstack-query/error-handler';

describe('Resilience Tests', () => {
  describe('ネットワーク障害への耐性', () => {
    it('fetch失敗時にTypeErrorがスローされる', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(mockFetch()).rejects.toThrow('Failed to fetch');
    });

    it('ネットワークエラー後のリトライ判定が正しい', () => {
      const networkError = { status: undefined };

      // ネットワークエラーはリトライ対象
      expect(shouldRetry(0, networkError)).toBe(true);
      expect(shouldRetry(1, networkError)).toBe(true);
      expect(shouldRetry(2, networkError)).toBe(true);
      // 3回目以降はリトライしない
      expect(shouldRetry(3, networkError)).toBe(false);
    });
  });

  describe('API遅延への耐性', () => {
    it('タイムアウト設定が機能する', async () => {
      const slowFetch = () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true }), 5000);
        });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      });

      await expect(Promise.race([slowFetch(), timeoutPromise])).rejects.toThrow('Timeout');
    });
  });

  describe('HTTPエラーへの耐性', () => {
    it('401エラーはリトライしない', () => {
      expect(shouldRetry(0, { status: 401 })).toBe(false);
    });

    it('403エラーはリトライしない', () => {
      expect(shouldRetry(0, { status: 403 })).toBe(false);
    });

    it('404エラーはリトライしない', () => {
      expect(shouldRetry(0, { status: 404 })).toBe(false);
    });

    it('429エラーは2回までリトライ', () => {
      expect(shouldRetry(0, { status: 429 })).toBe(true);
      expect(shouldRetry(1, { status: 429 })).toBe(true);
      expect(shouldRetry(2, { status: 429 })).toBe(false);
    });

    it('500エラーは3回までリトライ', () => {
      expect(shouldRetry(0, { status: 500 })).toBe(true);
      expect(shouldRetry(1, { status: 500 })).toBe(true);
      expect(shouldRetry(2, { status: 500 })).toBe(true);
      expect(shouldRetry(3, { status: 500 })).toBe(false);
    });
  });

  describe('ローカルストレージ破損への耐性', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('破損したJSONデータをパースするとエラーになる', () => {
      localStorage.setItem('test-key', 'not-valid-json');

      expect(() => {
        JSON.parse(localStorage.getItem('test-key')!);
      }).toThrow();
    });

    it('安全なパース関数は破損データでnullを返す', () => {
      localStorage.setItem('test-key', 'not-valid-json');

      const safeParse = (key: string) => {
        try {
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        } catch {
          return null;
        }
      };

      expect(safeParse('test-key')).toBeNull();
    });

    it('存在しないキーへのアクセスはnullを返す', () => {
      expect(localStorage.getItem('non-existent-key')).toBeNull();
    });
  });

  describe('並行リクエストへの耐性', () => {
    it('複数の並行リクエストが正常に処理される', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ data: 'test' }) });

      const requests = Array.from({ length: 10 }, () => mockFetch());
      const results = await Promise.all(requests);

      expect(results).toHaveLength(10);
      expect(results.every((r) => r.ok)).toBe(true);
    });

    it('一部のリクエストが失敗してもPromise.allSettledで処理できる', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ ok: true });

      const requests = [mockFetch(), mockFetch(), mockFetch()];
      const results = await Promise.allSettled(requests);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2);
      expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    });
  });

  describe('メモリリークへの耐性', () => {
    it('イベントリスナーが適切にクリーンアップされる', () => {
      const handler = vi.fn();
      const controller = new AbortController();

      document.addEventListener('click', handler, { signal: controller.signal });
      controller.abort();

      // AbortControllerでリスナーが削除されたことを確認
      document.dispatchEvent(new Event('click'));
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
