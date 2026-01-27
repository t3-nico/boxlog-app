/**
 * Record Inspector Store
 *
 * Record詳細表示用のインスペクター状態管理
 * - ドラフトモード: 新規作成時（DB未保存）
 * - 編集モード: 既存Record編集時
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Draft Record（ローカルのみ、未保存のレコード）
 */
export interface DraftRecord {
  plan_id: string | null;
  worked_at: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  fulfillment_score: number | null;
  note: string | null;
}

interface RecordInspectorState {
  /** 現在選択中のRecordのID（null = 新規作成モード） */
  selectedRecordId: string | null;
  /** Inspectorが開いているか */
  isOpen: boolean;
  /** ローカルのみのドラフトレコード（未保存） */
  draftRecord: DraftRecord | null;
}

interface RecordInspectorActions {
  /** Inspectorを開く（既存Record編集） */
  openInspector: (recordId: string) => void;
  /** Inspectorを閉じる */
  closeInspector: () => void;
  /** 選択中のRecordを変更 */
  setSelectedRecordId: (recordId: string | null) => void;
  /** ドラフトモードでInspectorを開く（新規作成） */
  openInspectorWithDraft: (initialData?: Partial<DraftRecord>) => void;
  /** ドラフトをクリアする */
  clearDraft: () => void;
  /** ドラフトを更新する */
  updateDraft: (updates: Partial<DraftRecord>) => void;
}

type RecordInspectorStore = RecordInspectorState & RecordInspectorActions;

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
function getTodayString(): string {
  const today = new Date().toISOString().split('T')[0];
  // split('T')[0] は必ず存在するが、TypeScriptは保証できないためフォールバック
  return today ?? new Date().toISOString().slice(0, 10);
}

export const useRecordInspectorStore = create<RecordInspectorStore>()(
  devtools(
    (set) => ({
      // State
      selectedRecordId: null,
      isOpen: false,
      draftRecord: null,

      // Actions
      openInspector: (recordId) => {
        set(
          {
            selectedRecordId: recordId,
            isOpen: true,
            draftRecord: null, // 既存Recordを開く時はdraftをクリア
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
            draftRecord: null, // 閉じる時はdraftもクリア
          },
          false,
          'closeInspector',
        );
      },

      setSelectedRecordId: (recordId) => {
        set({ selectedRecordId: recordId }, false, 'setSelectedRecordId');
      },

      openInspectorWithDraft: (initialData) => {
        set(
          {
            isOpen: true,
            selectedRecordId: null,
            draftRecord: {
              plan_id: initialData?.plan_id ?? null,
              worked_at: initialData?.worked_at ?? getTodayString(),
              start_time: initialData?.start_time ?? null,
              end_time: initialData?.end_time ?? null,
              duration_minutes: initialData?.duration_minutes ?? 60,
              fulfillment_score: initialData?.fulfillment_score ?? null,
              note: initialData?.note ?? null,
            },
          },
          false,
          'openInspectorWithDraft',
        );
      },

      clearDraft: () => set({ draftRecord: null }, false, 'clearDraft'),

      updateDraft: (updates) =>
        set(
          (state) => ({
            draftRecord: state.draftRecord ? { ...state.draftRecord, ...updates } : null,
          }),
          false,
          'updateDraft',
        ),
    }),
    { name: 'record-inspector-store' },
  ),
);
