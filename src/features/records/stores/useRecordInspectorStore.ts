/**
 * Record Inspector Store
 *
 * Record詳細表示用のインスペクター状態管理
 * 既存Record編集専用（新規作成は PlanInspector を使用）
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface RecordInspectorState {
  /** 現在選択中のRecordのID */
  selectedRecordId: string | null;
  /** Inspectorが開いているか */
  isOpen: boolean;
}

interface RecordInspectorActions {
  /** Inspectorを開く（既存Record編集） */
  openInspector: (recordId: string) => void;
  /** Inspectorを閉じる */
  closeInspector: () => void;
  /** 選択中のRecordを変更 */
  setSelectedRecordId: (recordId: string | null) => void;
}

type RecordInspectorStore = RecordInspectorState & RecordInspectorActions;

export const useRecordInspectorStore = create<RecordInspectorStore>()(
  devtools(
    (set) => ({
      // State
      selectedRecordId: null,
      isOpen: false,

      // Actions
      openInspector: (recordId) => {
        set(
          {
            selectedRecordId: recordId,
            isOpen: true,
          },
          false,
          'openInspector',
        );
      },

      closeInspector: () => {
        set(
          {
            isOpen: false,
            selectedRecordId: null,
          },
          false,
          'closeInspector',
        );
      },

      setSelectedRecordId: (recordId) => {
        set({ selectedRecordId: recordId }, false, 'setSelectedRecordId');
      },
    }),
    { name: 'record-inspector-store' },
  ),
);
