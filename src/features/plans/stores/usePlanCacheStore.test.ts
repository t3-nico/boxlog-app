import { beforeEach, describe, expect, it } from 'vitest';

import { usePlanCacheStore } from '@/stores/usePlanCacheStore';

describe('usePlanCacheStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    usePlanCacheStore.setState({ cache: {}, isMutating: false });
  });

  describe('updateCache', () => {
    it('キャッシュを更新できる', () => {
      usePlanCacheStore.getState().updateCache('plan-1', {
        recurrence_type: 'daily',
        recurrence_rule: null,
      });

      const cache = usePlanCacheStore.getState().cache;
      expect(cache['plan-1']).toEqual({
        recurrence_type: 'daily',
        recurrence_rule: null,
      });
    });

    it('既存のキャッシュをマージできる', () => {
      usePlanCacheStore.getState().updateCache('plan-1', {
        recurrence_type: 'daily',
      });

      usePlanCacheStore.getState().updateCache('plan-1', {
        recurrence_rule: 'FREQ=DAILY',
      });

      const cache = usePlanCacheStore.getState().cache;
      expect(cache['plan-1']).toEqual({
        recurrence_type: 'daily',
        recurrence_rule: 'FREQ=DAILY',
      });
    });

    it('複数のプランのキャッシュを管理できる', () => {
      usePlanCacheStore.getState().updateCache('plan-1', {
        recurrence_type: 'daily',
      });

      usePlanCacheStore.getState().updateCache('plan-2', {
        recurrence_type: 'weekly',
      });

      const cache = usePlanCacheStore.getState().cache;
      expect(cache['plan-1']?.recurrence_type).toBe('daily');
      expect(cache['plan-2']?.recurrence_type).toBe('weekly');
    });
  });

  describe('getCache', () => {
    it('キャッシュを取得できる', () => {
      usePlanCacheStore.getState().updateCache('plan-1', {
        recurrence_type: 'monthly',
      });

      const cached = usePlanCacheStore.getState().getCache('plan-1');
      expect(cached?.recurrence_type).toBe('monthly');
    });

    it('存在しないプランはundefinedを返す', () => {
      const cached = usePlanCacheStore.getState().getCache('non-existent');
      expect(cached).toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('キャッシュをクリアできる', () => {
      usePlanCacheStore.getState().updateCache('plan-1', {
        recurrence_type: 'daily',
      });

      usePlanCacheStore.getState().clearCache('plan-1');

      const cached = usePlanCacheStore.getState().getCache('plan-1');
      expect(cached).toBeUndefined();
    });

    it('他のプランのキャッシュには影響しない', () => {
      usePlanCacheStore.getState().updateCache('plan-1', {
        recurrence_type: 'daily',
      });

      usePlanCacheStore.getState().updateCache('plan-2', {
        recurrence_type: 'weekly',
      });

      usePlanCacheStore.getState().clearCache('plan-1');

      expect(usePlanCacheStore.getState().getCache('plan-1')).toBeUndefined();
      expect(usePlanCacheStore.getState().getCache('plan-2')).toBeDefined();
    });
  });

  describe('isMutating', () => {
    it('初期値はfalse', () => {
      expect(usePlanCacheStore.getState().isMutating).toBe(false);
    });

    it('setIsMutatingでtrueに設定できる', () => {
      usePlanCacheStore.getState().setIsMutating(true);
      expect(usePlanCacheStore.getState().isMutating).toBe(true);
    });

    it('setIsMutatingでfalseに戻せる', () => {
      usePlanCacheStore.getState().setIsMutating(true);
      usePlanCacheStore.getState().setIsMutating(false);
      expect(usePlanCacheStore.getState().isMutating).toBe(false);
    });
  });
});
