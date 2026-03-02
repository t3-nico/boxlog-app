import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { EntryOrigin, FulfillmentScore, RecurrenceType } from '@/core/types/entry';
import { isTimePast } from '@/lib/entry-status';

/**
 * Entry Inspector 状態管理
 *
 * plans/records を統合した entries テーブルに対応。
 * 「Time waits for no one」原則: createType は時間位置から自動判定。
 */

/**
 * Entry作成時に事前設定するデータ
 */
export interface EntryInitialData {
  start_time?: string; // ISO datetime string
  end_time?: string; // ISO datetime string
}

/**
 * Draft Entry（ローカルのみ、未保存のエントリ）
 */
export interface DraftEntry {
  title: string;
  description: string | null;
  origin: EntryOrigin;
  start_time: string | null;
  end_time: string | null;
  reminder_minutes?: number | null;
  fulfillment_score?: FulfillmentScore | null;
  recurrence_type?: RecurrenceType | null;
  recurrence_rule?: string | null;
  tagId?: string | null;
}

/**
 * 未保存の変更（Google Calendar準拠: 閉じる時に保存）
 * Note: undefined は「このフィールドを変更しない」を意味する
 */
export interface PendingChanges {
  title?: string;
  description?: string;
  start_time?: string | null;
  end_time?: string | null;
  reminder_minutes?: number | null;
  recurrence_type?: RecurrenceType | null;
  recurrence_rule?: string | null;
  fulfillment_score?: FulfillmentScore | null;
}

/**
 * Entry Inspector Store の状態
 */
interface EntryInspectorState {
  /** Inspector が開いているか */
  isOpen: boolean;
  /** 対象エントリのID（null = 新規作成モード） */
  entryId: string | null;
  /** 繰り返しエントリの特定インスタンス日付（YYYY-MM-DD形式） */
  instanceDate: string | null;
  /** 新規作成時の初期データ */
  initialData?: EntryInitialData | undefined;
  /** ローカルのみのドラフトエントリ（未保存） */
  draftEntry: DraftEntry | null;
  /** 未保存の変更（Google Calendar準拠: 閉じる時に一括保存） */
  pendingChanges: PendingChanges | null;
}

/**
 * Entry Inspector Store のアクション
 */
interface EntryInspectorActions {
  /** Inspector を開く */
  openInspector: (
    entryId: string | null,
    options?: {
      initialData?: EntryInitialData;
      instanceDate?: string;
    },
  ) => void;
  /** Inspector を閉じる */
  closeInspector: () => void;
  /** ドラフトモードでInspectorを開く（DB未保存） */
  openInspectorWithDraft: (initialData?: Partial<DraftEntry>) => void;
  /** ドラフトをクリアする */
  clearDraft: () => void;
  /** ドラフトを更新する */
  updateDraft: (updates: Partial<DraftEntry>) => void;
  /** 未保存の変更を追加（Google Calendar準拠） */
  addPendingChange: (changes: Partial<PendingChanges>) => void;
  /** 未保存の変更をクリア */
  clearPendingChanges: () => void;
  /** 未保存の変更を取得してクリア（保存前に呼ぶ） */
  consumePendingChanges: () => PendingChanges | null;
}

/**
 * Entry Inspector Store 型
 */
type EntryInspectorStore = EntryInspectorState & EntryInspectorActions;

/**
 * 時間位置から origin を自動判定
 */
function deriveOrigin(startTime: string | null | undefined): EntryOrigin {
  if (!startTime) return 'planned';
  return isTimePast(startTime) ? 'unplanned' : 'planned';
}

export const useEntryInspectorStore = create<EntryInspectorStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      entryId: null,
      instanceDate: null,
      initialData: undefined,
      draftEntry: null,
      pendingChanges: null,

      openInspector: (entryId, options) =>
        set(
          {
            isOpen: true,
            entryId,
            instanceDate: options?.instanceDate ?? null,
            initialData: entryId === null ? options?.initialData : undefined,
            draftEntry: null,
            pendingChanges: null,
          },
          false,
          'openInspector',
        ),

      closeInspector: () => {
        // カレンダーのドラッグ選択をクリア
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('calendar-drag-cancel'));
        }
        set(
          {
            isOpen: false,
            entryId: null,
            instanceDate: null,
            initialData: undefined,
            draftEntry: null,
            pendingChanges: null,
          },
          false,
          'closeInspector',
        );
      },

      openInspectorWithDraft: (initialData) => {
        const origin = initialData?.origin ?? deriveOrigin(initialData?.start_time);
        set(
          {
            isOpen: true,
            entryId: null,
            instanceDate: null,
            initialData: undefined,
            draftEntry: {
              title: initialData?.title ?? '',
              description: initialData?.description ?? null,
              origin,
              start_time: initialData?.start_time ?? null,
              end_time: initialData?.end_time ?? null,
              reminder_minutes: initialData?.reminder_minutes ?? null,
              fulfillment_score: initialData?.fulfillment_score ?? null,
              recurrence_type: initialData?.recurrence_type ?? null,
              recurrence_rule: initialData?.recurrence_rule ?? null,
              tagId: initialData?.tagId ?? null,
            },
            pendingChanges: null,
          },
          false,
          'openInspectorWithDraft',
        );
      },

      clearDraft: () => set({ draftEntry: null }, false, 'clearDraft'),

      updateDraft: (updates) =>
        set(
          (state) => ({
            draftEntry: state.draftEntry ? { ...state.draftEntry, ...updates } : null,
          }),
          false,
          'updateDraft',
        ),

      addPendingChange: (changes) =>
        set(
          (state) => ({
            pendingChanges: state.pendingChanges
              ? { ...state.pendingChanges, ...changes }
              : changes,
          }),
          false,
          'addPendingChange',
        ),

      clearPendingChanges: () => set({ pendingChanges: null }, false, 'clearPendingChanges'),

      consumePendingChanges: () => {
        const { pendingChanges } = get();
        if (pendingChanges) {
          set({ pendingChanges: null }, false, 'consumePendingChanges');
        }
        return pendingChanges;
      },
    }),
    { name: 'entry-inspector-store' },
  ),
);
