import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteConfirmStore } from './useDeleteConfirmStore';

describe('useDeleteConfirmStore', () => {
  beforeEach(() => {
    useDeleteConfirmStore.setState({
      isOpen: false,
      planId: null,
      planTitle: null,
      onConfirm: null,
    });
  });

  describe('初期状態', () => {
    it('ダイアログが閉じている', () => {
      const state = useDeleteConfirmStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.planId).toBeNull();
      expect(state.planTitle).toBeNull();
      expect(state.onConfirm).toBeNull();
    });
  });

  describe('openDialog', () => {
    it('ダイアログを開ける', () => {
      const onConfirm = vi.fn();
      useDeleteConfirmStore.getState().openDialog('plan-1', 'テストプラン', onConfirm);

      const state = useDeleteConfirmStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.planId).toBe('plan-1');
      expect(state.planTitle).toBe('テストプラン');
      expect(state.onConfirm).toBe(onConfirm);
    });

    it('タイトルなしでも開ける', () => {
      const onConfirm = vi.fn();
      useDeleteConfirmStore.getState().openDialog('plan-1', null, onConfirm);

      const state = useDeleteConfirmStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.planTitle).toBeNull();
    });

    it('onConfirmコールバックが保存される', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      useDeleteConfirmStore.getState().openDialog('plan-1', 'test', onConfirm);

      const stored = useDeleteConfirmStore.getState().onConfirm;
      expect(stored).not.toBeNull();
      await stored!();
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeDialog', () => {
    it('全状態をリセットする', () => {
      const onConfirm = vi.fn();
      useDeleteConfirmStore.getState().openDialog('plan-1', 'テスト', onConfirm);
      useDeleteConfirmStore.getState().closeDialog();

      const state = useDeleteConfirmStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.planId).toBeNull();
      expect(state.planTitle).toBeNull();
      expect(state.onConfirm).toBeNull();
    });

    it('既に閉じている状態でもエラーにならない', () => {
      expect(() => {
        useDeleteConfirmStore.getState().closeDialog();
      }).not.toThrow();

      expect(useDeleteConfirmStore.getState().isOpen).toBe(false);
    });
  });

  describe('開閉サイクル', () => {
    it('複数回の開閉が正しく動作する', () => {
      const onConfirm1 = vi.fn();
      const onConfirm2 = vi.fn();

      // 1回目
      useDeleteConfirmStore.getState().openDialog('plan-1', 'プラン1', onConfirm1);
      expect(useDeleteConfirmStore.getState().planId).toBe('plan-1');

      useDeleteConfirmStore.getState().closeDialog();
      expect(useDeleteConfirmStore.getState().isOpen).toBe(false);

      // 2回目
      useDeleteConfirmStore.getState().openDialog('plan-2', 'プラン2', onConfirm2);
      expect(useDeleteConfirmStore.getState().planId).toBe('plan-2');
      expect(useDeleteConfirmStore.getState().onConfirm).toBe(onConfirm2);
    });
  });
});
