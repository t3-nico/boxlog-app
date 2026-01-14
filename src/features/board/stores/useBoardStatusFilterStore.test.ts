import { beforeEach, describe, expect, it } from 'vitest';

import { useBoardStatusFilterStore } from './useBoardStatusFilterStore';

describe('useBoardStatusFilterStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useBoardStatusFilterStore.getState().resetFilters();
  });

  describe('初期状態', () => {
    it('すべてのステータスが表示状態', () => {
      const { isStatusVisible } = useBoardStatusFilterStore.getState();

      expect(isStatusVisible('open')).toBe(true);
      expect(isStatusVisible('closed')).toBe(true);
    });
  });

  describe('toggleStatus', () => {
    it('表示中のステータスを非表示にできる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('closed');

      expect(useBoardStatusFilterStore.getState().isStatusVisible('closed')).toBe(false);
    });

    it('非表示のステータスを表示にできる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('closed');
      useBoardStatusFilterStore.getState().toggleStatus('closed');

      expect(useBoardStatusFilterStore.getState().isStatusVisible('closed')).toBe(true);
    });

    it('他のステータスに影響しない', () => {
      useBoardStatusFilterStore.getState().toggleStatus('closed');

      expect(useBoardStatusFilterStore.getState().isStatusVisible('open')).toBe(true);
    });

    it('複数のステータスを非表示にできる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('open');
      useBoardStatusFilterStore.getState().toggleStatus('closed');

      expect(useBoardStatusFilterStore.getState().isStatusVisible('open')).toBe(false);
      expect(useBoardStatusFilterStore.getState().isStatusVisible('closed')).toBe(false);
    });
  });

  describe('isStatusVisible', () => {
    it('表示中のステータスにtrueを返す', () => {
      expect(useBoardStatusFilterStore.getState().isStatusVisible('open')).toBe(true);
    });

    it('非表示のステータスにfalseを返す', () => {
      useBoardStatusFilterStore.getState().toggleStatus('open');

      expect(useBoardStatusFilterStore.getState().isStatusVisible('open')).toBe(false);
    });
  });

  describe('resetFilters', () => {
    it('すべてのステータスを表示状態にリセットする', () => {
      // いくつかのステータスを非表示に
      useBoardStatusFilterStore.getState().toggleStatus('open');
      useBoardStatusFilterStore.getState().toggleStatus('closed');

      // リセット
      useBoardStatusFilterStore.getState().resetFilters();

      expect(useBoardStatusFilterStore.getState().isStatusVisible('open')).toBe(true);
      expect(useBoardStatusFilterStore.getState().isStatusVisible('closed')).toBe(true);
    });

    it('既にデフォルト状態でも安全にリセットできる', () => {
      useBoardStatusFilterStore.getState().resetFilters();

      expect(useBoardStatusFilterStore.getState().isStatusVisible('open')).toBe(true);
      expect(useBoardStatusFilterStore.getState().isStatusVisible('closed')).toBe(true);
    });
  });

  describe('visibleStatuses', () => {
    it('表示中のステータスのセットを取得できる', () => {
      const { visibleStatuses } = useBoardStatusFilterStore.getState();

      expect(visibleStatuses.has('open')).toBe(true);
      expect(visibleStatuses.has('closed')).toBe(true);
    });

    it('toggleで変更後のセットを取得できる', () => {
      useBoardStatusFilterStore.getState().toggleStatus('closed');

      const { visibleStatuses } = useBoardStatusFilterStore.getState();

      expect(visibleStatuses.has('open')).toBe(true);
      expect(visibleStatuses.has('closed')).toBe(false);
    });
  });
});
