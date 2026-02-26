'use client';

import { create } from 'zustand';

/**
 * 繰り返しプラン編集時のスコープ
 * Note: @/features/plans/components/RecurringEditConfirmDialog の RecurringEditScope と同一の定義
 */
export type RecurringEditScope = 'this' | 'thisAndFuture' | 'all';

interface RecurringEditConfirmState {
  isOpen: boolean;
  planTitle: string | null;
  mode: 'edit' | 'delete';
  onConfirm: ((scope: RecurringEditScope) => Promise<void>) | null;
  openDialog: (
    planTitle: string | null,
    mode: 'edit' | 'delete',
    onConfirm: (scope: RecurringEditScope) => Promise<void>,
  ) => void;
  closeDialog: () => void;
}

/**
 * 繰り返しプラン編集確認ダイアログの状態管理
 *
 * Googleカレンダー風のスコープ選択:
 * - このイベントのみ
 * - このイベント以降すべて
 * - すべてのイベント
 */
export const useRecurringEditConfirmStore = create<RecurringEditConfirmState>((set) => ({
  isOpen: false,
  planTitle: null,
  mode: 'edit',
  onConfirm: null,
  openDialog: (planTitle, mode, onConfirm) =>
    set({
      isOpen: true,
      planTitle,
      mode,
      onConfirm,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      planTitle: null,
      mode: 'edit',
      onConfirm: null,
    }),
}));
