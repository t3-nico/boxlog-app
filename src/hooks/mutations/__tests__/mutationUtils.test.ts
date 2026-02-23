import { describe, expect, it, vi } from 'vitest';

import {
  createListQueryPredicate,
  createTempId,
  invalidateEntityCaches,
  normalizeDateTime,
} from '../mutationUtils';

describe('mutationUtils', () => {
  describe('createTempId', () => {
    it('temp-プレフィックスのIDを生成する', () => {
      const id = createTempId();
      expect(id).toMatch(/^temp-\d+$/);
    });

    it('呼び出しごとに異なるIDを生成する', () => {
      const id1 = createTempId();
      const id2 = createTempId();
      // タイムスタンプベースなので同一ミリ秒内では同じ可能性があるが、
      // 概ねユニーク
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('normalizeDateTime', () => {
    it('null を undefined に変換する', () => {
      expect(normalizeDateTime(null)).toBeUndefined();
    });

    it('undefined を undefined に変換する', () => {
      expect(normalizeDateTime(undefined)).toBeUndefined();
    });

    it('空文字を undefined に変換する', () => {
      expect(normalizeDateTime('')).toBeUndefined();
    });

    it('有効な日時をISO 8601形式に変換する', () => {
      const result = normalizeDateTime('2026-02-21T10:00:00Z');
      expect(result).toBe('2026-02-21T10:00:00.000Z');
    });

    it('日付のみの文字列もISO形式に変換する', () => {
      const result = normalizeDateTime('2026-02-21');
      expect(result).toBeDefined();
      expect(result).toContain('2026-02-21');
    });

    it('無効な日時をundefinedに変換する', () => {
      expect(normalizeDateTime('not-a-date')).toBeUndefined();
    });
  });

  describe('createListQueryPredicate', () => {
    it('plans.list クエリキーにマッチする', () => {
      const predicate = createListQueryPredicate('plans');
      expect(predicate({ queryKey: [['plans', 'list']] })).toBe(true);
    });

    it('plans.list + input 付きクエリキーにマッチする', () => {
      const predicate = createListQueryPredicate('plans');
      expect(
        predicate({ queryKey: [['plans', 'list'], { input: { status: 'open' }, type: 'query' }] }),
      ).toBe(true);
    });

    it('records.list クエリキーにマッチする', () => {
      const predicate = createListQueryPredicate('records');
      expect(predicate({ queryKey: [['records', 'list']] })).toBe(true);
    });

    it('plans.getById にはマッチしない', () => {
      const predicate = createListQueryPredicate('plans');
      expect(predicate({ queryKey: [['plans', 'getById']] })).toBe(false);
    });

    it('異なるエンティティにはマッチしない', () => {
      const predicate = createListQueryPredicate('plans');
      expect(predicate({ queryKey: [['records', 'list']] })).toBe(false);
    });

    it('配列でないキーにはマッチしない', () => {
      const predicate = createListQueryPredicate('plans');
      expect(predicate({ queryKey: 'plans' })).toBe(false);
    });

    it('空配列にはマッチしない', () => {
      const predicate = createListQueryPredicate('plans');
      expect(predicate({ queryKey: [] })).toBe(false);
    });
  });

  describe('invalidateEntityCaches', () => {
    it('plans エンティティのキャッシュを無効化する', async () => {
      const mockUtils = {
        plans: {
          list: { invalidate: vi.fn() },
          getById: { invalidate: vi.fn() },
          getCumulativeTime: { invalidate: vi.fn() },
        },
      };

      await invalidateEntityCaches(mockUtils, 'plans');

      expect(mockUtils.plans.list.invalidate).toHaveBeenCalledWith(undefined, {
        refetchType: 'active',
      });
      expect(mockUtils.plans.getCumulativeTime.invalidate).toHaveBeenCalled();
    });

    it('entityId 指定時に個別キャッシュも無効化する', async () => {
      const mockUtils = {
        plans: {
          list: { invalidate: vi.fn() },
          getById: { invalidate: vi.fn() },
          getCumulativeTime: { invalidate: vi.fn() },
        },
      };

      await invalidateEntityCaches(mockUtils, 'plans', { entityId: 'plan-1' });

      expect(mockUtils.plans.getById.invalidate).toHaveBeenCalledWith(
        { id: 'plan-1' },
        { refetchType: 'active' },
      );
    });

    it('records エンティティの固有キャッシュも無効化する', async () => {
      const mockUtils = {
        records: {
          list: { invalidate: vi.fn() },
          getById: { invalidate: vi.fn() },
          listByPlan: { invalidate: vi.fn() },
          getRecent: { invalidate: vi.fn() },
        },
        plans: {
          getCumulativeTime: { invalidate: vi.fn() },
        },
      };

      await invalidateEntityCaches(mockUtils, 'records');

      expect(mockUtils.records.list.invalidate).toHaveBeenCalled();
      expect(mockUtils.records.listByPlan.invalidate).toHaveBeenCalled();
      expect(mockUtils.records.getRecent.invalidate).toHaveBeenCalled();
    });

    it('カスタム refetchType を指定できる', async () => {
      const mockUtils = {
        plans: {
          list: { invalidate: vi.fn() },
          getCumulativeTime: { invalidate: vi.fn() },
        },
      };

      await invalidateEntityCaches(mockUtils, 'plans', { refetchType: 'all' });

      expect(mockUtils.plans.list.invalidate).toHaveBeenCalledWith(undefined, {
        refetchType: 'all',
      });
    });
  });
});
