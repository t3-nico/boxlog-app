/**
 * Record Inspector Store
 *
 * Record詳細表示用のインスペクター状態管理
 * - ドラフトモード: 新規作成時（DB未保存）
 * - 編集モード: 既存Record編集時
 * - 表示モード: sheet（サイドパネル）/ popover（ポップアップ）
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Inspector表示モード
 * - sheet: サイドパネル（右側に固定表示）
 * - popover: ポップアップ（クリック位置に表示）
 */
export type InspectorDisplayMode = 'sheet' | 'popover';

/**
 * Popover位置情報
 */
export interface PopoverPosition {
  x: number;
  y: number;
}

/**
 * Draft Record（ローカルのみ、未保存のレコード）
 */
export interface DraftRecord {
  title: string; // タイトル（Planなしの場合は必須）
  plan_id: string | null;
  worked_at: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  fulfillment_score: number | null;
  note: string | null;
  tagIds: string[];
}

interface RecordInspectorState {
  /** 現在選択中のRecordのID（null = 新規作成モード） */
  selectedRecordId: string | null;
  /** Inspectorが開いているか */
  isOpen: boolean;
  /** ローカルのみのドラフトレコード（未保存） */
  draftRecord: DraftRecord | null;
  /** 表示モード（sheet: サイドパネル, popover: ポップアップ） */
  displayMode: InspectorDisplayMode;
  /** Popoverのアンカー要素の位置情報 */
  popoverAnchor?: { x: number; y: number } | undefined;
  /** Popoverの保存された位置（ドラッグ移動後） */
  popoverPosition: PopoverPosition | null;
}

interface OpenInspectorOptions {
  /** 表示モード */
  displayMode?: InspectorDisplayMode;
  /** Popoverのアンカー位置 */
  popoverAnchor?: { x: number; y: number };
}

interface RecordInspectorActions {
  /** Inspectorを開く（既存Record編集） */
  openInspector: (recordId: string, options?: OpenInspectorOptions) => void;
  /** Inspectorを閉じる */
  closeInspector: () => void;
  /** 選択中のRecordを変更 */
  setSelectedRecordId: (recordId: string | null) => void;
  /** ドラフトモードでInspectorを開く（新規作成） */
  openInspectorWithDraft: (
    initialData?: Partial<DraftRecord>,
    options?: OpenInspectorOptions,
  ) => void;
  /** ドラフトをクリアする */
  clearDraft: () => void;
  /** ドラフトを更新する */
  updateDraft: (updates: Partial<DraftRecord>) => void;
  /** 表示モードを変更 */
  setDisplayMode: (mode: InspectorDisplayMode) => void;
  /** Popover位置を保存 */
  setPopoverPosition: (position: PopoverPosition) => void;
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
    persist(
      (set) => ({
        // State
        selectedRecordId: null,
        isOpen: false,
        draftRecord: null,
        displayMode: 'sheet',
        popoverAnchor: undefined,
        popoverPosition: null,

        // Actions
        openInspector: (recordId, options) => {
          set(
            {
              selectedRecordId: recordId,
              isOpen: true,
              draftRecord: null, // 既存Recordを開く時はdraftをクリア
              displayMode: options?.displayMode ?? 'sheet',
              popoverAnchor: options?.popoverAnchor,
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
              popoverAnchor: undefined,
            },
            false,
            'closeInspector',
          );
        },

        setSelectedRecordId: (recordId) => {
          set({ selectedRecordId: recordId }, false, 'setSelectedRecordId');
        },

        openInspectorWithDraft: (initialData, options) => {
          set(
            {
              isOpen: true,
              selectedRecordId: null,
              draftRecord: {
                title: initialData?.title ?? '',
                plan_id: initialData?.plan_id ?? null,
                worked_at: initialData?.worked_at ?? getTodayString(),
                start_time: initialData?.start_time ?? null,
                end_time: initialData?.end_time ?? null,
                duration_minutes: initialData?.duration_minutes ?? 60,
                fulfillment_score: initialData?.fulfillment_score ?? null,
                note: initialData?.note ?? null,
                tagIds: initialData?.tagIds ?? [],
              },
              displayMode: options?.displayMode ?? 'sheet',
              popoverAnchor: options?.popoverAnchor,
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

        setDisplayMode: (mode) => set({ displayMode: mode }, false, 'setDisplayMode'),

        setPopoverPosition: (position) =>
          set({ popoverPosition: position }, false, 'setPopoverPosition'),
      }),
      {
        name: 'record-inspector-storage',
        // popoverPositionとdisplayModeのみ永続化
        partialize: (state) => ({
          displayMode: state.displayMode,
          popoverPosition: state.popoverPosition,
        }),
      },
    ),
    { name: 'record-inspector-store' },
  ),
);
