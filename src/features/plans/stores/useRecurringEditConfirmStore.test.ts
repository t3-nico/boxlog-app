import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRecurringEditConfirmStore } from './useRecurringEditConfirmStore';

describe('useRecurringEditConfirmStore', () => {
  beforeEach(() => {
    useRecurringEditConfirmStore.getState().closeDialog();
  });

  describe('初期状態', () => {
    it('ダイアログが閉じている', () => {
      const state = useRecurringEditConfirmStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.planTitle).toBeNull();
      expect(state.mode).toBe('edit');
      expect(state.onConfirm).toBeNull();
    });
  });

  describe('openDialog', () => {
    it('editモードで開ける', () => {
      const onConfirm = vi.fn();
      useRecurringEditConfirmStore.getState().openDialog('テストプラン', 'edit', onConfirm);
      const state = useRecurringEditConfirmStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.planTitle).toBe('テストプラン');
      expect(state.mode).toBe('edit');
      expect(state.onConfirm).toBe(onConfirm);
    });

    it('deleteモードで開ける', () => {
      const onConfirm = vi.fn();
      useRecurringEditConfirmStore.getState().openDialog('削除対象', 'delete', onConfirm);
      const state = useRecurringEditConfirmStore.getState();
      expect(state.mode).toBe('delete');
      expect(state.planTitle).toBe('削除対象');
    });

    it('planTitleがnullでも開ける', () => {
      useRecurringEditConfirmStore.getState().openDialog(null, 'edit', vi.fn());
      expect(useRecurringEditConfirmStore.getState().planTitle).toBeNull();
      expect(useRecurringEditConfirmStore.getState().isOpen).toBe(true);
    });
  });

  describe('closeDialog', () => {
    it('ダイアログを閉じて初期状態に戻す', () => {
      useRecurringEditConfirmStore.getState().openDialog('テスト', 'delete', vi.fn());
      useRecurringEditConfirmStore.getState().closeDialog();
      const state = useRecurringEditConfirmStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.planTitle).toBeNull();
      expect(state.mode).toBe('edit');
      expect(state.onConfirm).toBeNull();
    });
  });
});
