import { beforeEach, describe, expect, it } from 'vitest';

import { useRecordInspectorStore } from '@/stores/useRecordInspectorStore';

describe('useRecordInspectorStore', () => {
  beforeEach(() => {
    useRecordInspectorStore.getState().closeInspector();
  });

  describe('初期状態', () => {
    it('Inspectorが閉じている', () => {
      const state = useRecordInspectorStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.selectedRecordId).toBeNull();
    });
  });

  describe('openInspector', () => {
    it('Inspectorを開いてレコードIDを設定', () => {
      useRecordInspectorStore.getState().openInspector('rec-1');
      const state = useRecordInspectorStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.selectedRecordId).toBe('rec-1');
    });

    it('別のレコードに切り替えできる', () => {
      useRecordInspectorStore.getState().openInspector('rec-1');
      useRecordInspectorStore.getState().openInspector('rec-2');
      expect(useRecordInspectorStore.getState().selectedRecordId).toBe('rec-2');
    });
  });

  describe('closeInspector', () => {
    it('Inspectorを閉じて選択をクリア', () => {
      useRecordInspectorStore.getState().openInspector('rec-1');
      useRecordInspectorStore.getState().closeInspector();
      const state = useRecordInspectorStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.selectedRecordId).toBeNull();
    });
  });

  describe('setSelectedRecordId', () => {
    it('選択レコードIDを変更できる', () => {
      useRecordInspectorStore.getState().setSelectedRecordId('rec-3');
      expect(useRecordInspectorStore.getState().selectedRecordId).toBe('rec-3');
    });

    it('nullで選択解除', () => {
      useRecordInspectorStore.getState().setSelectedRecordId('rec-1');
      useRecordInspectorStore.getState().setSelectedRecordId(null);
      expect(useRecordInspectorStore.getState().selectedRecordId).toBeNull();
    });
  });
});
