import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { FulfillmentScore, RecurrenceType } from '@/core/types/entry';

/**
 * Entry Inspector 状態管理
 *
 * entries テーブルに対応。ドラフトモードなし（即DB保存 + edit mode）。
 */

/**
 * 未保存の変更（Google Calendar準拠: 閉じる時に保存）
 * Note: undefined は「このフィールドを変更しない」を意味する
 */
export interface PendingChanges {
  title?: string;
  description?: string;
  start_time?: string | null;
  end_time?: string | null;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  reminder_minutes?: number | null;
  recurrence_type?: RecurrenceType | null;
  recurrence_rule?: string | null;
  fulfillment_score?: FulfillmentScore | null;
}

/** Inspector ポップオーバーのアンカー位置 */
export interface AnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Entry Inspector Store の状態
 */
interface EntryInspectorState {
  /** Inspector が開いているか */
  isOpen: boolean;
  /** 対象エントリのID */
  entryId: string | null;
  /** 繰り返しエントリの特定インスタンス日付（YYYY-MM-DD形式） */
  instanceDate: string | null;
  /** 未保存の変更（Google Calendar準拠: 閉じる時に一括保存） */
  pendingChanges: PendingChanges | null;
  /** クリックされた要素の位置（Inspector の配置に使用） */
  anchorRect: AnchorRect | null;
}

/**
 * Entry Inspector Store のアクション
 */
interface EntryInspectorActions {
  /** Inspector を開く */
  openInspector: (
    entryId: string,
    options?: {
      instanceDate?: string;
    },
  ) => void;
  /** Inspector を閉じる */
  closeInspector: () => void;
  /** アンカー位置を設定（PlanCard クリック時に呼ぶ） */
  setAnchorRect: (rect: AnchorRect) => void;
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

export const useEntryInspectorStore = create<EntryInspectorStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      entryId: null,
      instanceDate: null,
      pendingChanges: null,
      anchorRect: null,

      openInspector: (entryId, options) =>
        set(
          {
            isOpen: true,
            entryId,
            instanceDate: options?.instanceDate ?? null,
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
            pendingChanges: null,
            anchorRect: null,
          },
          false,
          'closeInspector',
        );
      },

      setAnchorRect: (rect) => set({ anchorRect: rect }, false, 'setAnchorRect'),

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
