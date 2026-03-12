import { beforeEach, describe, expect, it } from 'vitest';

import { useTagCacheStore } from './useTagCacheStore';

describe('useTagCacheStore', () => {
  beforeEach(() => {
    useTagCacheStore.setState({
      mutationCount: 0,
      isSettling: false,
    });
  });

  describe('初期状態', () => {
    it('mutationCountが0', () => {
      expect(useTagCacheStore.getState().mutationCount).toBe(0);
    });

    it('isSettlingがfalse', () => {
      expect(useTagCacheStore.getState().isSettling).toBe(false);
    });
  });

  describe('mutationCount（参照カウント方式）', () => {
    it('incrementMutationでカウント増加', () => {
      useTagCacheStore.getState().incrementMutation();
      expect(useTagCacheStore.getState().mutationCount).toBe(1);
    });

    it('decrementMutationでカウント減少', () => {
      useTagCacheStore.getState().incrementMutation();
      useTagCacheStore.getState().incrementMutation();
      useTagCacheStore.getState().decrementMutation();
      expect(useTagCacheStore.getState().mutationCount).toBe(1);
    });

    it('0以下にはならない', () => {
      useTagCacheStore.getState().decrementMutation();
      expect(useTagCacheStore.getState().mutationCount).toBe(0);
    });

    it('複数mutation同時実行を追跡できる', () => {
      useTagCacheStore.getState().incrementMutation();
      useTagCacheStore.getState().incrementMutation();
      useTagCacheStore.getState().incrementMutation();
      expect(useTagCacheStore.getState().mutationCount).toBe(3);

      useTagCacheStore.getState().decrementMutation();
      useTagCacheStore.getState().decrementMutation();
      useTagCacheStore.getState().decrementMutation();
      expect(useTagCacheStore.getState().mutationCount).toBe(0);
    });
  });

  describe('isSettling', () => {
    it('trueに設定できる', () => {
      useTagCacheStore.getState().setIsSettling(true);
      expect(useTagCacheStore.getState().isSettling).toBe(true);
    });

    it('falseに戻せる', () => {
      useTagCacheStore.getState().setIsSettling(true);
      useTagCacheStore.getState().setIsSettling(false);
      expect(useTagCacheStore.getState().isSettling).toBe(false);
    });
  });
});
