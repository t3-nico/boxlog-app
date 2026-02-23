import { describe, expect, it } from 'vitest';

import { createCacheStore } from './createCacheStore';

interface TestCache {
  name?: string;
  score?: number;
}

describe('createCacheStore', () => {
  it('ファクトリで新しいストアを生成できる', () => {
    const useStore = createCacheStore<TestCache>();
    expect(useStore.getState().cache).toEqual({});
    expect(useStore.getState().isMutating).toBe(false);
  });

  describe('updateCache', () => {
    it('新規エンティティをキャッシュに追加', () => {
      const useStore = createCacheStore<TestCache>();
      useStore.getState().updateCache('id-1', { name: 'テスト' });
      expect(useStore.getState().cache['id-1']).toEqual({ name: 'テスト' });
    });

    it('既存キャッシュをマージ更新', () => {
      const useStore = createCacheStore<TestCache>();
      useStore.getState().updateCache('id-1', { name: 'テスト', score: 3 });
      useStore.getState().updateCache('id-1', { score: 5 });
      expect(useStore.getState().cache['id-1']).toEqual({ name: 'テスト', score: 5 });
    });

    it('他のエンティティに影響しない', () => {
      const useStore = createCacheStore<TestCache>();
      useStore.getState().updateCache('id-1', { name: 'A' });
      useStore.getState().updateCache('id-2', { name: 'B' });
      expect(useStore.getState().cache['id-1']?.name).toBe('A');
      expect(useStore.getState().cache['id-2']?.name).toBe('B');
    });
  });

  describe('getCache', () => {
    it('存在するキャッシュを取得', () => {
      const useStore = createCacheStore<TestCache>();
      useStore.getState().updateCache('id-1', { name: 'テスト' });
      expect(useStore.getState().getCache('id-1')).toEqual({ name: 'テスト' });
    });

    it('存在しないIDはundefined', () => {
      const useStore = createCacheStore<TestCache>();
      expect(useStore.getState().getCache('not-found')).toBeUndefined();
    });
  });

  describe('clearCache', () => {
    it('指定IDのキャッシュを削除', () => {
      const useStore = createCacheStore<TestCache>();
      useStore.getState().updateCache('id-1', { name: 'A' });
      useStore.getState().updateCache('id-2', { name: 'B' });
      useStore.getState().clearCache('id-1');
      expect(useStore.getState().getCache('id-1')).toBeUndefined();
      expect(useStore.getState().getCache('id-2')).toEqual({ name: 'B' });
    });
  });

  describe('isMutating', () => {
    it('mutation状態を切り替えできる', () => {
      const useStore = createCacheStore<TestCache>();
      useStore.getState().setIsMutating(true);
      expect(useStore.getState().isMutating).toBe(true);
      useStore.getState().setIsMutating(false);
      expect(useStore.getState().isMutating).toBe(false);
    });
  });
});
