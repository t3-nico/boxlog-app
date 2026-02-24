import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePlanInspectorStore } from './usePlanInspectorStore';

describe('usePlanInspectorStore', () => {
  beforeEach(() => {
    usePlanInspectorStore.setState({
      isOpen: false,
      planId: null,
      instanceDate: null,
      initialData: undefined,
      draftPlan: null,
      pendingChanges: null,
      createType: 'plan',
    });
  });

  describe('openInspector', () => {
    it('既存プランを開ける', () => {
      usePlanInspectorStore.getState().openInspector('plan-1');

      const state = usePlanInspectorStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.planId).toBe('plan-1');
      expect(state.instanceDate).toBeNull();
      expect(state.initialData).toBeUndefined();
    });

    it('インスタンス日付付きで開ける', () => {
      usePlanInspectorStore.getState().openInspector('plan-1', {
        instanceDate: '2026-02-15',
      });

      const state = usePlanInspectorStore.getState();
      expect(state.planId).toBe('plan-1');
      expect(state.instanceDate).toBe('2026-02-15');
    });

    it('新規作成モードで開ける（planId=null）', () => {
      usePlanInspectorStore.getState().openInspector(null, {
        initialData: {
          start_time: '2026-02-15T10:00:00',
          end_time: '2026-02-15T11:00:00',
        },
      });

      const state = usePlanInspectorStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.planId).toBeNull();
      expect(state.initialData).toEqual({
        start_time: '2026-02-15T10:00:00',
        end_time: '2026-02-15T11:00:00',
      });
    });

    it('既存プランを開く時はinitialDataを設定しない', () => {
      usePlanInspectorStore.getState().openInspector('plan-1', {
        initialData: { start_time: '2026-02-15T10:00:00' },
      });

      expect(usePlanInspectorStore.getState().initialData).toBeUndefined();
    });

    it('開く時にdraftPlanとpendingChangesをクリアする', () => {
      // 先にdraftを設定
      usePlanInspectorStore.setState({
        draftPlan: {
          title: 'test',
          description: null,
          status: 'open',
          start_time: null,
          end_time: null,
        },
        pendingChanges: { title: 'changed' },
      });

      usePlanInspectorStore.getState().openInspector('plan-1');

      expect(usePlanInspectorStore.getState().draftPlan).toBeNull();
      expect(usePlanInspectorStore.getState().pendingChanges).toBeNull();
    });
  });

  describe('closeInspector', () => {
    it('全状態をリセットする', () => {
      usePlanInspectorStore.getState().openInspector('plan-1', {
        instanceDate: '2026-02-15',
      });

      usePlanInspectorStore.getState().closeInspector();

      const state = usePlanInspectorStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.planId).toBeNull();
      expect(state.instanceDate).toBeNull();
      expect(state.initialData).toBeUndefined();
      expect(state.draftPlan).toBeNull();
      expect(state.pendingChanges).toBeNull();
      expect(state.createType).toBe('plan');
    });

    it('calendar-drag-cancelイベントを発火する', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      usePlanInspectorStore.getState().closeInspector();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'calendar-drag-cancel' }),
      );

      dispatchSpy.mockRestore();
    });
  });

  describe('openInspectorWithDraft', () => {
    it('ドラフトモードで開ける', () => {
      usePlanInspectorStore.getState().openInspectorWithDraft({
        title: 'ドラフトプラン',
        start_time: '2026-02-15T10:00:00',
      });

      const state = usePlanInspectorStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.planId).toBeNull();
      expect(state.draftPlan).not.toBeNull();
      expect(state.draftPlan!.title).toBe('ドラフトプラン');
      expect(state.draftPlan!.start_time).toBe('2026-02-15T10:00:00');
      expect(state.draftPlan!.status).toBe('open');
    });

    it('初期値なしの場合デフォルト値が設定される', () => {
      usePlanInspectorStore.getState().openInspectorWithDraft();

      const draft = usePlanInspectorStore.getState().draftPlan!;
      expect(draft.title).toBe('');
      expect(draft.description).toBeNull();
      expect(draft.start_time).toBeNull();
      expect(draft.end_time).toBeNull();
      expect(draft.tagIds).toEqual([]);
      expect(draft.plan_id).toBeNull();
      expect(draft.description).toBeNull();
    });

    it('createTypeを指定できる', () => {
      usePlanInspectorStore.getState().openInspectorWithDraft({}, 'record');

      expect(usePlanInspectorStore.getState().createType).toBe('record');
    });

    it('createTypeのデフォルトはplan', () => {
      usePlanInspectorStore.getState().openInspectorWithDraft();

      expect(usePlanInspectorStore.getState().createType).toBe('plan');
    });
  });

  describe('setCreateType', () => {
    it('createTypeを変更できる', () => {
      usePlanInspectorStore.getState().setCreateType('record');
      expect(usePlanInspectorStore.getState().createType).toBe('record');

      usePlanInspectorStore.getState().setCreateType('plan');
      expect(usePlanInspectorStore.getState().createType).toBe('plan');
    });
  });

  describe('draft操作', () => {
    it('clearDraftでドラフトをクリアできる', () => {
      usePlanInspectorStore.getState().openInspectorWithDraft({ title: 'test' });
      expect(usePlanInspectorStore.getState().draftPlan).not.toBeNull();

      usePlanInspectorStore.getState().clearDraft();
      expect(usePlanInspectorStore.getState().draftPlan).toBeNull();
    });

    it('updateDraftでドラフトを部分更新できる', () => {
      usePlanInspectorStore.getState().openInspectorWithDraft({ title: '元のタイトル' });

      usePlanInspectorStore.getState().updateDraft({ title: '更新後のタイトル' });

      const draft = usePlanInspectorStore.getState().draftPlan!;
      expect(draft.title).toBe('更新後のタイトル');
      expect(draft.status).toBe('open'); // 他のフィールドは変更なし
    });

    it('draftPlanがnullの場合updateDraftは無視される', () => {
      usePlanInspectorStore.getState().updateDraft({ title: 'test' });
      expect(usePlanInspectorStore.getState().draftPlan).toBeNull();
    });
  });

  describe('pendingChanges操作', () => {
    it('addPendingChangeで未保存の変更を追加できる', () => {
      usePlanInspectorStore.getState().addPendingChange({ title: '変更後' });

      expect(usePlanInspectorStore.getState().pendingChanges).toEqual({
        title: '変更後',
      });
    });

    it('複数回のaddPendingChangeがマージされる', () => {
      usePlanInspectorStore.getState().addPendingChange({ title: '変更1' });
      usePlanInspectorStore.getState().addPendingChange({ description: '変更2' });

      expect(usePlanInspectorStore.getState().pendingChanges).toEqual({
        title: '変更1',
        description: '変更2',
      });
    });

    it('同じキーへのaddPendingChangeは上書きされる', () => {
      usePlanInspectorStore.getState().addPendingChange({ title: '変更1' });
      usePlanInspectorStore.getState().addPendingChange({ title: '変更2' });

      expect(usePlanInspectorStore.getState().pendingChanges!.title).toBe('変更2');
    });

    it('clearPendingChangesで未保存の変更をクリアできる', () => {
      usePlanInspectorStore.getState().addPendingChange({ title: '変更' });
      usePlanInspectorStore.getState().clearPendingChanges();

      expect(usePlanInspectorStore.getState().pendingChanges).toBeNull();
    });

    it('consumePendingChangesで変更を取得しクリアする', () => {
      usePlanInspectorStore.getState().addPendingChange({ title: '変更' });

      const consumed = usePlanInspectorStore.getState().consumePendingChanges();

      expect(consumed).toEqual({ title: '変更' });
      expect(usePlanInspectorStore.getState().pendingChanges).toBeNull();
    });

    it('consumePendingChangesで変更がない場合nullを返す', () => {
      const consumed = usePlanInspectorStore.getState().consumePendingChanges();

      expect(consumed).toBeNull();
      expect(usePlanInspectorStore.getState().pendingChanges).toBeNull();
    });
  });
});
